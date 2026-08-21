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

const demoPath = path.join(process.cwd(), 'public', 'samples', 'absence-lens-demo-15000.xlsx');
const largePath = path.join(process.cwd(), 'samples', 'absence-lens-rendimiento-150000.xlsx');

async function analyse(fixturePath: string) {
  const readStart = performance.now();
  const sheets = await readWorkbook(fixturePath);
  const workbook = {
    sheets: sheets.map((sheet) => ({ name: sheet.sheet, rows: sheet.data })),
  } as WorkbookData;
  const readMs = performance.now() - readStart;

  const validateStart = performance.now();
  const validation = validateAbsenceWorkbook(workbook);
  const validateMs = performance.now() - validateStart;

  const analyseStart = performance.now();
  const { episodes } = normalizeAbsenceRecords(validation.records, cutoff);
  const shortRecurrences = findShortDurationRecurrences(episodes, cutoff);
  const longDurations = buildLongDurationCandidates(episodes, cutoff);
  const reviewRows = buildReviewRows(validation.records, episodes);
  const analyseMs = performance.now() - analyseStart;

  return { validation, shortRecurrences, longDurations, reviewRows, readMs, validateMs, analyseMs };
}

function seconds(milliseconds: number): string {
  return (milliseconds / 1000).toFixed(2);
}

// El ejecutor absorbe la consola: las mediciones se dejan en un fichero ignorado por git.
const report: string[] = [];

function record(lines: string[]): void {
  report.push(...lines, '');
  writeFileSync(path.join(process.cwd(), 'rendimiento-ultima-ejecucion.txt'), report.join('\n'));
}

describe.runIf(existsSync(demoPath))('libro de demostración de 15.000 filas', () => {
  it('produce candidatos de ambas reglas, para que sirva como ejemplo', async () => {
    const result = await analyse(demoPath);

    expect(result.validation.errors).toEqual([]);
    expect(result.validation.records).toHaveLength(15_000);

    record([
      'Libro de demostración (15.000 filas)',
      `  Candidatos R1:          ${result.shortRecurrences.length}`,
      `  Candidatos R2:          ${result.longDurations.length}`,
      `  Filas de revisión:      ${result.reviewRows.length}`,
    ]);

    // Un libro de ejemplo sin candidatos no sirve para demostrar nada.
    expect(result.shortRecurrences.length).toBeGreaterThan(0);
    expect(result.longDurations.length).toBeGreaterThan(0);
  }, 60_000);
});

describe.runIf(existsSync(largePath))('rendimiento con 150.000 filas', () => {
  it('lee, valida y analiza el libro completo dentro de los límites esperados', async () => {
    const result = await analyse(largePath);

    expect(result.validation.errors).toEqual([]);
    expect(result.validation.records).toHaveLength(150_000);

    record([
      'Libro de rendimiento (150.000 filas)',
      `  Lectura del libro:      ${seconds(result.readMs)} s`,
      `  Validación del perfil:  ${seconds(result.validateMs)} s`,
      `  Análisis completo:      ${seconds(result.analyseMs)} s`,
      `  Candidatos R1:          ${result.shortRecurrences.length}`,
      `  Candidatos R2:          ${result.longDurations.length}`,
      `  Filas de revisión:      ${result.reviewRows.length}`,
    ]);

    expect(result.shortRecurrences.length).toBeGreaterThan(0);
    expect(result.longDurations.length).toBeGreaterThan(0);

    // Umbrales holgados: detectan una regresión de orden de magnitud, no ruido de máquina.
    expect(result.validateMs).toBeLessThan(10_000);
    expect(result.analyseMs).toBeLessThan(10_000);
  }, 120_000);
});
