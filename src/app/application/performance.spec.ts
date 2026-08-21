import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import readWorkbook from 'read-excel-file/node';
import { describe, expect, it } from 'vitest';
import { buildLongDurationCandidates } from '../domain/long-duration';
import { localDate } from '../domain/local-date';
import { findShortDurationRecurrences } from '../domain/recurrence';
import { validateAbsenceWorkbook } from './import-profile';
import { normalizeAbsenceRecords } from './normalize';
import { buildReviewRows } from './review';
import { WorkbookData } from './workbook';

const cutoff = localDate(2026, 7, 31);
const fixturePath = path.join(
  process.cwd(),
  'samples',
  'absence-lens-rendimiento-150000.xlsx',
);

// El libro se regenera con `pnpm sample:large`; si falta, la medición se omite.
const describeIfFixture = existsSync(fixturePath) ? describe : describe.skip;

function seconds(milliseconds: number): string {
  return (milliseconds / 1000).toFixed(2);
}

describeIfFixture('rendimiento con 150.000 filas', () => {
  it('lee, valida y analiza el libro completo dentro de los límites esperados', async () => {
    const readStart = performance.now();
    const sheets = await readWorkbook(fixturePath);
    const workbook = {
      sheets: sheets.map((sheet) => ({ name: sheet.sheet, rows: sheet.data })),
    } as WorkbookData;
    const readMs = performance.now() - readStart;

    const validateStart = performance.now();
    const validation = validateAbsenceWorkbook(workbook);
    const validateMs = performance.now() - validateStart;

    expect(validation.errors).toEqual([]);
    expect(validation.records).toHaveLength(150_000);

    const analyseStart = performance.now();
    const { episodes } = normalizeAbsenceRecords(validation.records, cutoff);
    const shortRecurrences = findShortDurationRecurrences(episodes, cutoff);
    const longDurations = buildLongDurationCandidates(episodes, cutoff);
    const reviewRows = buildReviewRows(validation.records, episodes);
    const analyseMs = performance.now() - analyseStart;

    expect(shortRecurrences.length).toBeGreaterThan(0);
    expect(longDurations.length).toBeGreaterThan(0);
    expect(reviewRows.length).toBeGreaterThan(0);

    const report = [
      `Libro:                  ${path.basename(fixturePath)}`,
      `Filas:                  ${validation.records.length}`,
      `Lectura del libro:      ${seconds(readMs)} s`,
      `Validación del perfil:   ${seconds(validateMs)} s`,
      `Análisis completo:      ${seconds(analyseMs)} s`,
      `Candidatos R1:          ${shortRecurrences.length}`,
      `Candidatos R2:          ${longDurations.length}`,
      `Filas de revisión:       ${reviewRows.length}`,
    ].join('\n');

    // El ejecutor absorbe la consola: la medición se deja en un fichero ignorado por git.
    writeFileSync(path.join(process.cwd(), 'rendimiento-ultima-ejecucion.txt'), report, 'utf8');
    console.log(report);

    // Umbrales holgados: detectan una regresión de orden de magnitud, no ruido de máquina.
    expect(validateMs).toBeLessThan(10_000);
    expect(analyseMs).toBeLessThan(10_000);
  }, 120_000);
});
