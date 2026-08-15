import { ValidatedAbsenceRecord } from './import-profile';
import { WorkbookCell } from './workbook';
import { AbsenceDescription, AbsenceEpisode, isSicknessDescription } from '../domain/absence';
import {
  LocalDate,
  compareLocalDates,
  formatSpanishDate,
  fromSpreadsheetDate,
} from '../domain/local-date';

export const REVIEW_COLUMNS = [
  { key: 'employeeId', label: 'Nº Nómina' },
  { key: 'activeStatus', label: 'Activo/Inactivo' },
  { key: 'laborAgreement', label: 'Convenio Laboral' },
  { key: 'start', label: 'Fecha Inicio Ausencia' },
  { key: 'originalEnd', label: 'Fecha Fin Ausencia' },
  { key: 'effectiveEnd', label: 'Final efectivo' },
  { key: 'description', label: 'Descripción Ausencia' },
  { key: 'scope', label: 'Ambito' },
  { key: 'birthDate', label: 'Fecha Nacimiento' },
  { key: 'employeeType', label: 'Tipo de Empleado' },
  { key: 'contractType', label: 'Fijo/Temporal' },
  { key: 'salaryPlan', label: 'Plan Salarial - Desc.' },
  { key: 'sex', label: 'Sexo' },
  { key: 'locationCode', label: 'Ubicación - Código' },
  { key: 'effectiveDuration', label: 'Duración efectiva' },
  { key: 'status', label: 'Estado del episodio' },
] as const;

export type ReviewColumn = (typeof REVIEW_COLUMNS)[number]['key'];
export type SortDirection = 'asc' | 'desc';

export interface ReviewColumnFilter {
  readonly column: ReviewColumn;
  readonly value: string;
}

export interface ReviewQuery {
  readonly filters: readonly ReviewColumnFilter[];
  readonly startFrom: LocalDate | null;
  readonly startTo: LocalDate | null;
  readonly sortColumn: ReviewColumn;
  readonly sortDirection: SortDirection;
}

export interface ReviewRow {
  readonly sourceRow: number;
  readonly employeeId: string;
  readonly activeStatus: string;
  readonly laborAgreement: string;
  readonly start: LocalDate;
  readonly originalEnd: LocalDate;
  readonly effectiveEnd: LocalDate | null;
  readonly description: AbsenceDescription;
  readonly scope: string;
  readonly birthDate: string;
  readonly employeeType: string;
  readonly contractType: string;
  readonly salaryPlan: string;
  readonly sex: string;
  readonly locationCode: string;
  readonly effectiveDuration: number | null;
  readonly status: string;
}

export function buildReviewRows(
  records: readonly ValidatedAbsenceRecord[],
  episodes: readonly AbsenceEpisode[],
): ReviewRow[] {
  const episodesByRow = new Map(episodes.map((episode) => [episode.sourceRow, episode]));

  return records.flatMap((record) => {
    const episode = episodesByRow.get(record.sourceRow);
    if (!isSicknessDescription(record.description)) return [];
    if (!episode) {
      return [];
    }

    return [
      {
        sourceRow: record.sourceRow,
        employeeId: record.employeeId,
        activeStatus: cellText(record.activeStatus),
        laborAgreement: cellText(record.laborAgreement),
        start: record.start,
        originalEnd: record.end,
        effectiveEnd: episode.effectiveEnd,
        description: record.description,
        scope: cellText(record.scope),
        birthDate: cellText(record.birthDate),
        employeeType: cellText(record.employeeType),
        contractType: cellText(record.contractType),
        salaryPlan: cellText(record.salaryPlan),
        sex: cellText(record.sex),
        locationCode: record.locationCode,
        effectiveDuration:
          episode.effectiveEnd === null
            ? null
            : daysBetweenInclusive(record.start, episode.effectiveEnd),
        status: episodeStatus(episode),
      },
    ];
  });
}

export function rowsForEmployees(
  rows: readonly ReviewRow[],
  employeeIds: ReadonlySet<string>,
): ReviewRow[] {
  return rows.filter((row) => employeeIds.has(row.employeeId));
}

export function queryReviewRows(rows: readonly ReviewRow[], query: ReviewQuery): ReviewRow[] {
  return rows
    .filter((row) => matchesDateRange(row.start, query.startFrom, query.startTo))
    .filter((row) =>
      query.filters.every((filter) => {
        const expected = normalizeSearch(filter.value);
        return (
          expected.length === 0 ||
          normalizeSearch(reviewValue(row, filter.column)).includes(expected)
        );
      }),
    )
    .sort((left, right) => {
      const comparison = compareReviewValues(left, right, query.sortColumn);
      const directed = query.sortDirection === 'asc' ? comparison : -comparison;
      return directed || left.sourceRow - right.sourceRow;
    });
}

export function reviewValue(row: ReviewRow, column: ReviewColumn): string {
  switch (column) {
    case 'start':
      return formatSpanishDate(row.start);
    case 'originalEnd':
      return formatSpanishDate(row.originalEnd);
    case 'effectiveEnd':
      return row.effectiveEnd ? formatSpanishDate(row.effectiveEnd) : '';
    case 'effectiveDuration':
      return row.effectiveDuration?.toString() ?? '';
    default:
      return row[column];
  }
}

export function reviewColumnLabel(column: ReviewColumn): string {
  return REVIEW_COLUMNS.find((item) => item.key === column)?.label ?? column;
}

function matchesDateRange(value: LocalDate, from: LocalDate | null, to: LocalDate | null): boolean {
  return (
    (from === null || compareLocalDates(value, from) >= 0) &&
    (to === null || compareLocalDates(value, to) <= 0)
  );
}

function compareReviewValues(left: ReviewRow, right: ReviewRow, column: ReviewColumn): number {
  if (column === 'start' || column === 'originalEnd') {
    return compareLocalDates(left[column], right[column]);
  }
  if (column === 'effectiveEnd') {
    if (left.effectiveEnd === null) return right.effectiveEnd === null ? 0 : 1;
    if (right.effectiveEnd === null) return -1;
    return compareLocalDates(left.effectiveEnd, right.effectiveEnd);
  }
  if (column === 'effectiveDuration') {
    return (
      (left.effectiveDuration ?? Number.MAX_SAFE_INTEGER) -
      (right.effectiveDuration ?? Number.MAX_SAFE_INTEGER)
    );
  }
  return reviewValue(left, column).localeCompare(reviewValue(right, column), 'es', {
    numeric: true,
    sensitivity: 'base',
  });
}

function cellText(value: WorkbookCell): string {
  if (value instanceof Date) {
    const date = fromSpreadsheetDate(value);
    return date ? formatSpanishDate(date) : '';
  }
  return value === null ? '' : String(value).trim();
}

function episodeStatus(episode: AbsenceEpisode): string {
  if (episode.warnings.includes('START_AFTER_CUTOFF')) return 'Excluido por fecha de corte';
  if (episode.warnings.includes('OPEN_END')) return 'Activo';
  if (episode.warnings.includes('END_AFTER_CUTOFF')) return 'Recortado al corte';
  return 'Finalizado';
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase('es');
}

function daysBetweenInclusive(start: LocalDate, end: LocalDate): number {
  const startUtc = Date.UTC(start.year, start.month - 1, start.day);
  const endUtc = Date.UTC(end.year, end.month - 1, end.day);
  return Math.floor((endUtc - startUtc) / 86_400_000) + 1;
}
