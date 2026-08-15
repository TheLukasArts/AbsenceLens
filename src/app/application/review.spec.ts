import { describe, expect, it } from 'vitest';
import { ValidatedAbsenceRecord } from './import-profile';
import {
  ReviewQuery,
  buildReviewRows,
  queryReviewRows,
  reviewValue,
  rowsForEmployees,
} from './review';
import { AbsenceEpisode } from '../domain/absence';
import { localDate } from '../domain/local-date';

const records: ValidatedAbsenceRecord[] = [
  record(2, '000002', 'MAD', 'PAX', 'Fijo', localDate(2026, 2, 1), localDate(2026, 2, 3)),
  record(3, '000001', 'BCN', 'RAM', 'Temporal', localDate(2026, 1, 1), localDate(2026, 8, 1)),
  record(4, '000003', 'AGP', 'PAX', 'Fijo', localDate(2026, 3, 1), localDate(2026, 3, 2)),
];

const episodes: AbsenceEpisode[] = [
  episode(records[0]),
  episode(records[1], localDate(2026, 7, 31), ['END_AFTER_CUTOFF']),
  episode(records[2]),
];

describe('review projection', () => {
  it('relaciona registros y episodios por fila y conserva la nómina como texto', () => {
    const rows = buildReviewRows(records, episodes);

    expect(rows).toHaveLength(3);
    expect(rows[1]).toMatchObject({
      sourceRow: 3,
      employeeId: '000001',
      effectiveDuration: 212,
      status: 'Recortado al corte',
    });
    expect(reviewValue(rows[1], 'effectiveEnd')).toBe('31/07/2026');
  });

  it('selecciona únicamente registros de los empleados visibles', () => {
    expect(
      rowsForEmployees(buildReviewRows(records, episodes), new Set(['000001', '000003'])),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ employeeId: '000001' }),
        expect.objectContaining({ employeeId: '000003' }),
      ]),
    );
  });

  it('combina filtros de cualquier columna y un rango inclusivo de inicio', () => {
    const result = queryReviewRows(buildReviewRows(records, episodes), {
      ...baseQuery,
      filters: [
        { column: 'scope', value: 'pax' },
        { column: 'contractType', value: 'fij' },
      ],
      startFrom: localDate(2026, 2, 1),
      startTo: localDate(2026, 3, 1),
    });

    expect(result.map((row) => row.employeeId)).toEqual(['000002', '000003']);
  });

  it('ordena de forma estable por fechas, números calculados y texto', () => {
    const rows = buildReviewRows(records, episodes);

    expect(queryReviewRows(rows, { ...baseQuery, sortColumn: 'start' }).map(id)).toEqual([
      '000001',
      '000002',
      '000003',
    ]);
    expect(
      queryReviewRows(rows, {
        ...baseQuery,
        sortColumn: 'effectiveDuration',
        sortDirection: 'desc',
      }).map(id),
    ).toEqual(['000001', '000002', '000003']);
    expect(queryReviewRows(rows, { ...baseQuery, sortColumn: 'employeeId' }).map(id)).toEqual([
      '000001',
      '000002',
      '000003',
    ]);
  });
});

const baseQuery: ReviewQuery = {
  filters: [],
  startFrom: null,
  startTo: null,
  sortColumn: 'start',
  sortDirection: 'asc',
};

function record(
  sourceRow: number,
  employeeId: string,
  locationCode: string,
  scope: string,
  contractType: string,
  start: ReturnType<typeof localDate>,
  end: ReturnType<typeof localDate>,
): ValidatedAbsenceRecord {
  return {
    sourceRow,
    employeeId,
    activeStatus: 'Activo',
    laborAgreement: 'TI-15',
    start,
    end,
    description: 'Enfermedad con Baja en la S.S',
    scope,
    birthDate: new Date(1970, 6, 15),
    employeeType: 'FD',
    contractType,
    salaryPlan: 'ADMINISTRATIVOS',
    sex: 'F',
    locationCode,
  };
}

function episode(
  source: ValidatedAbsenceRecord,
  effectiveEnd = source.end,
  warnings: AbsenceEpisode['warnings'] = [],
): AbsenceEpisode {
  return {
    id: `row-${source.sourceRow}`,
    sourceRow: source.sourceRow,
    employeeId: source.employeeId,
    start: source.start,
    originalEnd: source.end,
    effectiveEnd,
    description: source.description,
    workCentre: source.locationCode,
    warnings,
  };
}

function id(row: { readonly employeeId: string }): string {
  return row.employeeId;
}
