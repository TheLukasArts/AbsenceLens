import { describe, expect, it } from 'vitest';
import { AbsenceDescription, AbsenceEpisode, EpisodeWarningCode } from './absence';
import { buildLongDurationCandidates, selectLongDurationTop } from './long-duration';
import { addDays, localDate } from './local-date';

interface EpisodeOptions {
  readonly centre?: string;
  readonly description?: AbsenceDescription;
  readonly effectiveEnd?: ReturnType<typeof localDate> | null;
  readonly warnings?: readonly EpisodeWarningCode[];
}

function episode(
  employeeId: string,
  start: ReturnType<typeof localDate>,
  duration: number,
  id: string,
  options: EpisodeOptions = {},
): AbsenceEpisode {
  const end = addDays(start, duration - 1);
  return {
    id,
    sourceRow: Number(id.replace(/\D/g, '')) + 2,
    employeeId,
    start,
    originalEnd: end,
    effectiveEnd: options.effectiveEnd === undefined ? end : options.effectiveEnd,
    description: options.description ?? 'Enfermedad con Baja en la S.S',
    workCentre: options.centre ?? 'MAD',
    warnings: options.warnings ?? [],
  };
}

const cutoff = localDate(2026, 7, 31);

describe('R2', () => {
  it('incluye 180 días y excluye 179, vacaciones y episodios posteriores al corte', () => {
    const episodes = [
      episode('000001', localDate(2025, 1, 1), 180, 'e1'),
      episode('000002', localDate(2025, 1, 1), 179, 'e2'),
      episode('000003', localDate(2025, 1, 1), 200, 'e3', {
        description: 'Vacaciones',
      }),
      episode('000004', localDate(2026, 8, 1), 200, 'e4', {
        effectiveEnd: null,
        warnings: ['START_AFTER_CUTOFF'],
      }),
    ];

    const result = buildLongDurationCandidates(episodes, cutoff);

    expect(result.map((candidate) => candidate.employeeId)).toEqual(['000001']);
    expect(result[0].maximumDuration).toBe(180);
  });

  it('representa una sola vez al empleado mediante su episodio máximo más reciente', () => {
    const episodes = [
      episode('000001', localDate(2024, 1, 1), 190, 'e1', { centre: 'MAD' }),
      episode('000001', localDate(2025, 1, 1), 210, 'e2', { centre: 'BCN' }),
      episode('000001', localDate(2025, 2, 1), 210, 'e3', {
        centre: 'AGP',
        warnings: ['END_AFTER_CUTOFF'],
      }),
    ];

    const [candidate] = buildLongDurationCandidates(episodes, cutoff);

    expect(candidate.employeeId).toBe('000001');
    expect(candidate.maximumDuration).toBe(210);
    expect(candidate.representativeEpisode.id).toBe('e3');
    expect(candidate.longEpisodeCount).toBe(3);
    expect(candidate.explanation.episodes.map((item) => item.episode.id)).toEqual([
      'e3',
      'e2',
      'e1',
    ]);
    expect(candidate.explanation.episodes[0].representative).toBe(true);
    expect(candidate.explanation.warnings).toEqual(['END_AFTER_CUTOFF']);
  });

  it('ordena por duración, inicio y nómina', () => {
    const episodes = [
      episode('000003', localDate(2025, 1, 1), 200, 'e1'),
      episode('000002', localDate(2025, 2, 1), 200, 'e2'),
      episode('000001', localDate(2025, 2, 1), 200, 'e3'),
      episode('000004', localDate(2024, 1, 1), 250, 'e4'),
    ];

    expect(buildLongDurationCandidates(episodes, cutoff).map((item) => item.employeeId)).toEqual([
      '000004',
      '000001',
      '000002',
      '000003',
    ]);
  });

  it('filtra después de construir la candidatura global del empleado', () => {
    const candidates = buildLongDurationCandidates(
      [
        episode('000001', localDate(2024, 1, 1), 250, 'e1', { centre: 'MAD' }),
        episode('000001', localDate(2025, 1, 1), 200, 'e2', { centre: 'BCN' }),
        episode('000002', localDate(2025, 1, 1), 220, 'e3', { centre: 'BCN' }),
      ],
      cutoff,
    );

    expect(
      selectLongDurationTop(candidates, new Set(['BCN'])).map((item) => item.employeeId),
    ).toEqual(['000002']);
    expect(selectLongDurationTop(candidates, new Set(['MAD']))[0].longEpisodeCount).toBe(2);
  });

  it('limita el resultado después de filtrar y valida el límite', () => {
    const candidates = buildLongDurationCandidates(
      Array.from({ length: 12 }, (_, index) =>
        episode(
          String(index + 1).padStart(6, '0'),
          localDate(2025, 1, 1),
          200 + index,
          `e${index + 1}`,
          { centre: index < 2 ? 'BCN' : 'MAD' },
        ),
      ),
      cutoff,
    );

    expect(selectLongDurationTop(candidates)).toHaveLength(10);
    expect(selectLongDurationTop(candidates, new Set(['BCN']))).toHaveLength(2);
    expect(() => selectLongDurationTop(candidates, new Set(), -1)).toThrow('INVALID_RESULT_LIMIT');
  });
});
