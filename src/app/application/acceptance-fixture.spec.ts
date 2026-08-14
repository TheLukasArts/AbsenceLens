import path from 'node:path';
import readWorkbook from 'read-excel-file/node';
import { beforeAll, describe, expect, it } from 'vitest';
import { AbsenceEpisode } from '../domain/absence';
import {
  buildLongDurationCandidates,
  LongDurationCandidate,
  selectLongDurationTop,
} from '../domain/long-duration';
import { localDate } from '../domain/local-date';
import { findShortDurationRecurrences } from '../domain/recurrence';
import { validateAbsenceWorkbook } from './import-profile';
import { normalizeAbsenceRecords } from './normalize';
import { WorkbookData } from './workbook';

const cutoff = localDate(2026, 7, 31);

describe('fixture sintético de aceptación', () => {
  let episodes: readonly AbsenceEpisode[];

  beforeAll(async () => {
    const fixturePath = path.join(process.cwd(), 'samples', 'absence-lens-aceptacion-v1.xlsx');
    const sheets = await readWorkbook(fixturePath);
    const workbook = {
      sheets: sheets.map((sheet) => ({
        name: sheet.sheet,
        rows: sheet.data,
      })),
    } as WorkbookData;

    const validation = validateAbsenceWorkbook(workbook);
    expect(validation.errors).toEqual([]);
    expect(validation.records).toHaveLength(73);

    episodes = normalizeAbsenceRecords(validation.records, cutoff).episodes;
  });

  it('produce exactamente los siete candidatos R1 esperados', () => {
    const result = findShortDurationRecurrences(episodes, cutoff);

    expect(result.map(({ employeeId, episodeCount }) => ({ employeeId, episodeCount }))).toEqual([
      { employeeId: '910001', episodeCount: 6 },
      { employeeId: '910008', episodeCount: 5 },
      { employeeId: '910010', episodeCount: 5 },
      { employeeId: '910011', episodeCount: 5 },
      { employeeId: '910004', episodeCount: 5 },
      { employeeId: '910006', episodeCount: 5 },
      { employeeId: '910002', episodeCount: 5 },
    ]);
  });

  it('produce exactamente el top global R2 esperado', () => {
    const candidates = buildLongDurationCandidates(episodes, cutoff);
    const result = selectLongDurationTop(candidates);

    expect(
      result.map(({ employeeId, maximumDuration, representativeEpisode }) => ({
        employeeId,
        maximumDuration,
        start: representativeEpisode.start,
        centre: representativeEpisode.workCentre,
      })),
    ).toEqual([
      {
        employeeId: '920010',
        maximumDuration: 300,
        start: localDate(2024, 10, 1),
        centre: 'MAD',
      },
      {
        employeeId: '920011',
        maximumDuration: 250,
        start: localDate(2024, 12, 1),
        centre: 'BCN',
      },
      {
        employeeId: '920003',
        maximumDuration: 212,
        start: localDate(2026, 1, 1),
        centre: 'AGP',
      },
      {
        employeeId: '920005',
        maximumDuration: 212,
        start: localDate(2026, 1, 1),
        centre: 'AGP',
      },
      {
        employeeId: '920006',
        maximumDuration: 210,
        start: localDate(2025, 1, 1),
        centre: 'MAD',
      },
      {
        employeeId: '920008',
        maximumDuration: 200,
        start: localDate(2025, 2, 1),
        centre: 'BCN',
      },
      {
        employeeId: '920009',
        maximumDuration: 200,
        start: localDate(2025, 2, 1),
        centre: 'BCN',
      },
      {
        employeeId: '920007',
        maximumDuration: 200,
        start: localDate(2025, 1, 1),
        centre: 'MAD',
      },
      {
        employeeId: '920001',
        maximumDuration: 180,
        start: localDate(2025, 1, 1),
        centre: 'ABC',
      },
    ]);

    expect(candidate(candidates, '920006').longEpisodeCount).toBe(2);
    expect(candidate(candidates, '920003').explanation.warnings).toContain('OPEN_END');
    expect(candidate(candidates, '920005').explanation.warnings).toContain('END_AFTER_CUTOFF');
  });

  it('recalcula el top R2 por centro representativo sin reagrupar empleados', () => {
    const candidates = buildLongDurationCandidates(episodes, cutoff);

    expect(ids(selectLongDurationTop(candidates, new Set(['BCN'])))).toEqual([
      '920011',
      '920008',
      '920009',
    ]);
    expect(ids(selectLongDurationTop(candidates, new Set(['MAD'])))).toEqual([
      '920010',
      '920006',
      '920007',
    ]);
    expect(ids(selectLongDurationTop(candidates, new Set(['AGP'])))).toEqual(['920003', '920005']);
    expect(ids(selectLongDurationTop(candidates, new Set(['BCN', 'MAD'])))).toEqual([
      '920010',
      '920011',
      '920006',
      '920008',
      '920009',
      '920007',
    ]);
  });
});

function ids(candidates: readonly LongDurationCandidate[]): string[] {
  return candidates.map((item) => item.employeeId);
}

function candidate(
  candidates: readonly LongDurationCandidate[],
  employeeId: string,
): LongDurationCandidate {
  const result = candidates.find((item) => item.employeeId === employeeId);
  if (!result) {
    throw new Error(`CANDIDATE_NOT_FOUND: ${employeeId}`);
  }
  return result;
}
