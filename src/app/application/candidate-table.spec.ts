import { describe, expect, it } from 'vitest';
import { AbsenceEpisode } from '../domain/absence';
import { addDays, parseIsoDate } from '../domain/local-date';
import { buildLongDurationCandidates } from '../domain/long-duration';
import { findShortDurationRecurrences } from '../domain/recurrence';
import {
  buildRecurrenceTableRows,
  LongDurationSortColumn,
  RecurrenceSortColumn,
  sortLongDurationTableRows,
  sortRecurrenceTableRows,
} from './candidate-table';

const cutoff = parseIsoDate('2026-07-31')!;
const statusLabels = { active: 'Activo', finalized: 'Finalizado', trimmed: 'Recortado al corte' };

describe('tablas de candidatos', () => {
  it('elige el centro del inicio contabilizado más reciente y desempata por fila de origen', () => {
    const episodes = [
      ...shortEpisodes('000001', 5, '2026-01-01', 'MAD'),
      episode('000001', '2026-02-01', 1, 'BCN', 20),
      episode('000001', '2026-02-01', 1, 'BIO', 10),
      episode('000001', '2026-03-01', 31, 'AGP', 30),
      { ...episode('000001', '2026-08-01', 1, 'ALC', 40), effectiveEnd: null },
      { ...episode('000001', '2026-07-01', 1, 'ABC', 50), description: 'Vacaciones' as const },
    ];
    const candidates = findShortDurationRecurrences(episodes, cutoff);
    const rows = buildRecurrenceTableRows(candidates);
    expect(rows[0].locationCode).toBe('BIO');
    expect(rows[0].episodeCount).toBe(7);
    expect(candidates[0]).not.toHaveProperty('locationCode');
    expect(episodes[5].workCentre).toBe('BCN');
  });

  it.each<RecurrenceSortColumn>(['employeeId', 'episodeCount', 'locationCode', 'mostRecentStart'])(
    'ordena recurrencia por %s en ambos sentidos sin mutar el conjunto',
    (column) => {
      const rows = buildRecurrenceTableRows(
        findShortDurationRecurrences(
          [
            ...shortEpisodes('000010', 12, '2026-01-01', 'CENTRO10'),
            ...shortEpisodes('000002', 5, '2025-12-01', 'CENTRO2'),
          ],
          cutoff,
        ),
      );
      const original = [...rows];
      expect(ids(sortRecurrenceTableRows(rows, column, 'asc'))).toEqual(['000002', '000010']);
      expect(ids(sortRecurrenceTableRows(rows, column, 'desc'))).toEqual(['000010', '000002']);
      expect(rows).toEqual(original);
      expect(sortRecurrenceTableRows(rows, '', '')).toEqual(original);
    },
  );

  it('mantiene el orden de la regla en empates, también en sentido descendente', () => {
    const rows = buildRecurrenceTableRows(
      findShortDurationRecurrences(
        [
          ...shortEpisodes('000002', 5, '2026-01-01', 'MAD'),
          ...shortEpisodes('000001', 6, '2026-01-01', 'MAD'),
        ],
        cutoff,
      ),
    );
    expect(ids(rows)).toEqual(['000001', '000002']);
    for (const direction of ['asc', 'desc'] as const) {
      expect(sortRecurrenceTableRows(rows, 'locationCode', direction)).toEqual(rows);
      expect(sortRecurrenceTableRows(rows, 'window', direction)).toEqual(rows);
    }
  });

  it.each<LongDurationSortColumn>([
    'employeeId',
    'maximumDuration',
    'start',
    'effectiveEnd',
    'workCentre',
    'longEpisodeCount',
    'status',
  ])('ordena larga duración por %s comparando fechas, cantidades y textos', (column) => {
    const active = {
      ...episode('000010', '2026-01-01', 212, 'CENTRO10', 3),
      warnings: ['OPEN_END'] as const,
    };
    const rows = buildLongDurationCandidates(
      [
        episode('000002', '2025-01-01', 180, 'CENTRO2', 1),
        episode('000002', '2025-08-01', 300, 'CENTRO2', 2),
        active,
      ],
      cutoff,
    );
    const original = [...rows];
    // Payroll, start, end and centre increase from 000002 to 000010;
    // duration, episode count and the displayed state increase in the opposite order.
    const expected = ['maximumDuration', 'longEpisodeCount', 'status'].includes(column)
      ? ['000010', '000002']
      : ['000002', '000010'];
    expect(ids(sortLongDurationTableRows(rows, column, 'asc', statusLabels))).toEqual(expected);
    expect(ids(sortLongDurationTableRows(rows, column, 'desc', statusLabels))).toEqual(
      [...expected].reverse(),
    );
    expect(rows).toEqual(original);
    expect(sortLongDurationTableRows(rows, '', '', statusLabels)).toEqual(original);
  });

  it('ordena los tres estados por su etiqueta y conserva empates en larga duración', () => {
    const rows = buildLongDurationCandidates(
      [
        episode('000001', '2025-01-01', 180, 'MAD', 1),
        { ...episode('000002', '2026-01-01', 212, 'MAD', 2), warnings: ['OPEN_END'] },
        {
          ...episode('000003', '2025-08-01', 365, 'MAD', 3),
          originalEnd: parseIsoDate('2026-08-10')!,
          warnings: ['END_AFTER_CUTOFF'],
        },
      ],
      cutoff,
    );
    expect(ids(sortLongDurationTableRows(rows, 'status', 'asc', statusLabels))).toEqual([
      '000002',
      '000001',
      '000003',
    ]);
    expect(ids(sortLongDurationTableRows(rows, 'status', 'desc', statusLabels))).toEqual([
      '000003',
      '000001',
      '000002',
    ]);
    for (const direction of ['asc', 'desc'] as const) {
      expect(sortLongDurationTableRows(rows, 'workCentre', direction, statusLabels)).toEqual(rows);
    }
  });
});

function ids(rows: readonly { employeeId: string }[]): string[] {
  return rows.map((row) => row.employeeId);
}

function shortEpisodes(
  employeeId: string,
  count: number,
  start: string,
  centre: string,
): AbsenceEpisode[] {
  const first = parseIsoDate(start)!;
  return Array.from({ length: count }, (_, index) => ({
    ...episode(employeeId, start, 1, centre, index + 2),
    start: addDays(first, index * 2),
    originalEnd: addDays(first, index * 2),
    effectiveEnd: addDays(first, index * 2),
  }));
}

function episode(
  employeeId: string,
  start: string,
  duration: number,
  centre: string,
  sourceRow: number,
): AbsenceEpisode {
  const first = parseIsoDate(start)!;
  const end = addDays(first, duration - 1);
  return {
    id: `${employeeId}-${sourceRow}`,
    sourceRow,
    employeeId,
    start: first,
    originalEnd: end,
    effectiveEnd: end,
    description: 'Enfermedad con Baja en la S.S',
    workCentre: centre,
    warnings: [],
  };
}
