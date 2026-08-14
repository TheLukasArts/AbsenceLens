import { describe, expect, it } from 'vitest';
import { EXPECTED_HEADERS, validateAbsenceWorkbook } from './import-profile';
import { WorkbookData } from './workbook';

function workbook(rows: WorkbookData['sheets'][number]['rows']): WorkbookData {
  return { sheets: [{ name: 'Ausencias', rows }] };
}

describe('perfil ausencias-v1', () => {
  it('exige una sola hoja y las catorce cabeceras exactas', () => {
    expect(validateAbsenceWorkbook({ sheets: [] }).errors.map((issue) => issue.code)).toEqual([
      'WORKBOOK_SHEET_COUNT',
    ]);

    const changedHeaders = [...EXPECTED_HEADERS];
    changedHeaders[2] = 'Convenio' as (typeof EXPECTED_HEADERS)[number];
    expect(
      validateAbsenceWorkbook(workbook([changedHeaders])).errors.map((issue) => issue.code),
    ).toEqual(['HEADER_MISSING', 'HEADER_ADDITIONAL']);
  });

  it('conserva la nómina como texto y descarta la duración de origen', () => {
    const result = validateAbsenceWorkbook(
      workbook([
        EXPECTED_HEADERS,
        [
          '000070',
          'Activo',
          'RG-14',
          '01/07/2026',
          '01/07/2026',
          'Accidente Laboral',
          'RAM',
          '15/07/1970',
          'FD',
          'Fijo',
          'ADMINISTRATIVOS',
          'F',
          'MAD',
          999,
        ],
      ]),
    );

    expect(result.errors).toEqual([]);
    expect(result.records[0].employeeId).toBe('000070');
    expect(result.warnings).toEqual([
      {
        severity: 'warning',
        code: 'SOURCE_DURATION_DISCARDED',
        row: 2,
        column: 'Número de Días de Ausencia a Fecha de hoy',
      },
    ]);
  });

  it('sanea errores de fila sin incluir el valor de la celda', () => {
    const result = validateAbsenceWorkbook(
      workbook([
        EXPECTED_HEADERS,
        [
          70,
          'Activo',
          'RG-14',
          'fecha-no-válida',
          '01/07/2026',
          'desconocida',
          'RAM',
          null,
          'FD',
          'Fijo',
          'ADMINISTRATIVOS',
          'F',
          'MAD',
          null,
        ],
      ]),
    );

    expect(result.errors.map(({ code, row, column }) => ({ code, row, column }))).toEqual([
      { code: 'EMPLOYEE_ID_NOT_TEXT', row: 2, column: 'Nº Nómina' },
      { code: 'DATE_INVALID', row: 2, column: 'Fecha Inicio Ausencia' },
      {
        code: 'ABSENCE_DESCRIPTION_UNKNOWN',
        row: 2,
        column: 'Descripción Ausencia',
      },
    ]);
    expect(JSON.stringify(result.errors)).not.toContain('fecha-no-válida');
    expect(JSON.stringify(result.errors)).not.toContain('desconocida');
  });
});
