import { ABSENCE_DESCRIPTIONS, AbsenceDescription } from '../domain/absence';
import {
  LocalDate,
  compareLocalDates,
  fromSpreadsheetDate,
  parseSpanishShortDate,
} from '../domain/local-date';
import { WorkbookCell, WorkbookData } from './workbook';

export const IMPORT_PROFILE_ID = 'ausencias-v1';

export const EXPECTED_HEADERS = [
  'Nº Nómina',
  'Activo/Inactivo',
  'Convenio Laboral',
  'Fecha Inicio Ausencia',
  'Fecha Fin Ausencia',
  'Descripción Ausencia',
  'Ambito',
  'Fecha Nacimiento',
  'Tipo de Empleado',
  'Fijo/Temporal',
  'Plan Salarial - Desc.',
  'Sexo',
  'Ubicación - Código',
  'Número de Días de Ausencia a Fecha de hoy',
] as const;

export type ImportColumn = (typeof EXPECTED_HEADERS)[number];

export type ImportErrorCode =
  | 'FILE_EXTENSION_INVALID'
  | 'WORKBOOK_READ_FAILED'
  | 'WORKBOOK_SHEET_COUNT'
  | 'HEADER_MISSING'
  | 'HEADER_ADDITIONAL'
  | 'HEADER_DUPLICATED'
  | 'HEADER_ORDER_INCOMPATIBLE'
  | 'REQUIRED_VALUE_MISSING'
  | 'EMPLOYEE_ID_NOT_TEXT'
  | 'DATE_INVALID'
  | 'END_BEFORE_START'
  | 'ABSENCE_DESCRIPTION_UNKNOWN';

export type ImportWarningCode = never;

export interface ImportIssue {
  readonly severity: 'error' | 'warning';
  readonly code: ImportErrorCode | ImportWarningCode;
  readonly row?: number;
  readonly column?: ImportColumn | 'Estructura';
}

export interface ValidatedAbsenceRecord {
  readonly sourceRow: number;
  readonly employeeId: string;
  readonly activeStatus: WorkbookCell;
  readonly laborAgreement: WorkbookCell;
  readonly start: LocalDate;
  readonly end: LocalDate;
  readonly description: AbsenceDescription;
  readonly scope: WorkbookCell;
  readonly birthDate: WorkbookCell;
  readonly employeeType: WorkbookCell;
  readonly contractType: WorkbookCell;
  readonly salaryPlan: WorkbookCell;
  readonly sex: WorkbookCell;
  readonly locationCode: string;
}

export interface WorkbookValidationResult {
  readonly records: readonly ValidatedAbsenceRecord[];
  readonly errors: readonly ImportIssue[];
  readonly warnings: readonly ImportIssue[];
}

export function validateAbsenceWorkbook(workbook: WorkbookData): WorkbookValidationResult {
  if (workbook.sheets.length !== 1) {
    return {
      records: [],
      errors: [{ severity: 'error', code: 'WORKBOOK_SHEET_COUNT', column: 'Estructura' }],
      warnings: [],
    };
  }

  const rows = workbook.sheets[0].rows;
  const headerErrors = validateHeaders(rows[0] ?? []);
  if (headerErrors.length > 0) {
    return { records: [], errors: headerErrors, warnings: [] };
  }

  const records: ValidatedAbsenceRecord[] = [];
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];

  rows.slice(1).forEach((row, index) => {
    const sourceRow = index + 2;
    if (row.every((cell) => isEmpty(cell))) {
      return;
    }

    const employeeId = parseEmployeeId(row[0]);
    const start = parseDateCell(row[3]);
    const end = parseDateCell(row[4]);
    const description = parseDescription(row[5]);

    const errorsBeforeRow = errors.length;

    if (isEmpty(row[0])) {
      errors.push(error(sourceRow, 'Nº Nómina', 'REQUIRED_VALUE_MISSING'));
    } else if (employeeId === null) {
      errors.push(error(sourceRow, 'Nº Nómina', 'EMPLOYEE_ID_NOT_TEXT'));
    }

    if (isEmpty(row[3])) {
      errors.push(error(sourceRow, 'Fecha Inicio Ausencia', 'REQUIRED_VALUE_MISSING'));
    } else if (start === null) {
      errors.push(error(sourceRow, 'Fecha Inicio Ausencia', 'DATE_INVALID'));
    }

    if (isEmpty(row[4])) {
      errors.push(error(sourceRow, 'Fecha Fin Ausencia', 'REQUIRED_VALUE_MISSING'));
    } else if (end === null) {
      errors.push(error(sourceRow, 'Fecha Fin Ausencia', 'DATE_INVALID'));
    }

    if (isEmpty(row[5])) {
      errors.push(error(sourceRow, 'Descripción Ausencia', 'REQUIRED_VALUE_MISSING'));
    } else if (description === null) {
      errors.push(error(sourceRow, 'Descripción Ausencia', 'ABSENCE_DESCRIPTION_UNKNOWN'));
    }

    if (start !== null && end !== null && compareLocalDates(end, start) < 0) {
      errors.push(error(sourceRow, 'Fecha Fin Ausencia', 'END_BEFORE_START'));
    }

    const rowHasErrors = errors.length > errorsBeforeRow;
    if (
      !rowHasErrors &&
      employeeId !== null &&
      start !== null &&
      end !== null &&
      description !== null
    ) {
      records.push({
        sourceRow,
        employeeId,
        activeStatus: row[1] ?? null,
        laborAgreement: row[2] ?? null,
        start,
        end,
        description,
        scope: row[6] ?? null,
        birthDate: row[7] ?? null,
        employeeType: row[8] ?? null,
        contractType: row[9] ?? null,
        salaryPlan: row[10] ?? null,
        sex: row[11] ?? null,
        locationCode: typeof row[12] === 'string' ? row[12].trim() : '',
      });
    }
  });

  return { records, errors, warnings };
}

function validateHeaders(header: readonly WorkbookCell[]): ImportIssue[] {
  const trimmed = header.map((cell) => (typeof cell === 'string' ? cell.trim() : ''));
  // Muchos exportadores dejan columnas vacías a la derecha de la última cabecera real.
  let lastFilled = trimmed.length - 1;
  while (lastFilled >= 0 && trimmed[lastFilled] === '') {
    lastFilled -= 1;
  }
  const actual = trimmed.slice(0, lastFilled + 1);
  const issues: ImportIssue[] = [];

  for (const expected of EXPECTED_HEADERS) {
    const occurrences = actual.filter((value) => value === expected).length;
    if (occurrences === 0) {
      issues.push({ severity: 'error', code: 'HEADER_MISSING', column: expected });
    } else if (occurrences > 1) {
      issues.push({ severity: 'error', code: 'HEADER_DUPLICATED', column: expected });
    }
  }

  actual.forEach((value, index) => {
    if (!EXPECTED_HEADERS.includes(value as ImportColumn)) {
      issues.push({
        severity: 'error',
        code: 'HEADER_ADDITIONAL',
        column: 'Estructura',
        row: index + 1,
      });
    }
  });

  if (
    issues.length === 0 &&
    (actual.length !== EXPECTED_HEADERS.length ||
      actual.some((value, index) => value !== EXPECTED_HEADERS[index]))
  ) {
    issues.push({
      severity: 'error',
      code: 'HEADER_ORDER_INCOMPATIBLE',
      column: 'Estructura',
    });
  }

  return issues;
}

function parseEmployeeId(value: WorkbookCell | undefined): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}

function parseDateCell(value: WorkbookCell | undefined): LocalDate | null {
  if (value instanceof Date) {
    return fromSpreadsheetDate(value);
  }
  if (typeof value === 'string') {
    return parseSpanishShortDate(value);
  }
  return null;
}

function parseDescription(value: WorkbookCell | undefined): AbsenceDescription | null {
  return typeof value === 'string' &&
    ABSENCE_DESCRIPTIONS.includes(value.trim() as AbsenceDescription)
    ? (value.trim() as AbsenceDescription)
    : null;
}

function isEmpty(value: WorkbookCell | undefined): boolean {
  return (
    value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
  );
}

function error(row: number, column: ImportColumn, code: ImportErrorCode): ImportIssue {
  return { severity: 'error', code, row, column };
}
