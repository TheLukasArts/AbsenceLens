import { describe, expect, it } from 'vitest';
import { localDate } from '../domain/local-date';
import { ValidatedAbsenceRecord } from './import-profile';
import { normalizeAbsenceRecords } from './normalize';

function record(
  sourceRow: number,
  start: ReturnType<typeof localDate>,
  end: ReturnType<typeof localDate>,
): ValidatedAbsenceRecord {
  return {
    sourceRow,
    employeeId: '000001',
    activeStatus: 'Activo',
    laborAgreement: 'RG-14',
    start,
    end,
    description: 'Enfermedad con Baja en la S.S',
    scope: 'RAM',
    birthDate: null,
    employeeType: 'FD',
    contractType: 'Fijo',
    salaryPlan: 'ADMINISTRATIVOS',
    sex: 'F',
    locationCode: 'MAD',
  };
}

describe('normalización por fecha de corte', () => {
  const cutoff = localDate(2026, 7, 31);

  it('recorta el final abierto y conserva el original', () => {
    const result = normalizeAbsenceRecords(
      [record(2, localDate(2026, 7, 1), localDate(2999, 12, 31))],
      cutoff,
    );

    expect(result.episodes[0].effectiveEnd).toEqual(cutoff);
    expect(result.episodes[0].originalEnd).toEqual(localDate(2999, 12, 31));
    expect(result.episodes[0].warnings).toEqual(['OPEN_END']);
  });

  it('excluye inicios posteriores y recorta finales ordinarios posteriores', () => {
    const result = normalizeAbsenceRecords(
      [
        record(2, localDate(2026, 8, 1), localDate(2026, 8, 2)),
        record(3, localDate(2026, 7, 30), localDate(2026, 8, 2)),
      ],
      cutoff,
    );

    expect(result.episodes[0].effectiveEnd).toBeNull();
    expect(result.episodes[0].warnings).toEqual(['START_AFTER_CUTOFF']);
    expect(result.episodes[1].effectiveEnd).toEqual(cutoff);
    expect(result.episodes[1].warnings).toEqual(['END_AFTER_CUTOFF']);
  });
});
