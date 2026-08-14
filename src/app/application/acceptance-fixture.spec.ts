import path from 'node:path';
import readWorkbook from 'read-excel-file/node';
import { describe, expect, it } from 'vitest';
import { findShortDurationRecurrences } from '../domain/recurrence';
import { localDate } from '../domain/local-date';
import { validateAbsenceWorkbook } from './import-profile';
import { normalizeAbsenceRecords } from './normalize';
import { WorkbookData } from './workbook';

describe('fixture sintético de aceptación', () => {
  it('produce exactamente los siete candidatos R1 esperados', async () => {
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

    const cutoff = localDate(2026, 7, 31);
    const normalized = normalizeAbsenceRecords(validation.records, cutoff);
    const result = findShortDurationRecurrences(normalized.episodes, cutoff);

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
});
