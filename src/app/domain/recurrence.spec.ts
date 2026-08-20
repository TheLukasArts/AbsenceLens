import { describe, expect, it } from 'vitest';
import { AbsenceEpisode } from './absence';
import { addDays, localDate } from './local-date';
import { findShortDurationRecurrences, recurrenceWindowFor } from './recurrence';

function episode(
  employeeId: string,
  start: ReturnType<typeof localDate>,
  duration: number,
  id: string,
): AbsenceEpisode {
  return {
    id,
    sourceRow: Number(id.replace(/\D/g, '')) + 2,
    employeeId,
    start,
    originalEnd: addDays(start, duration - 1),
    effectiveEnd: addDays(start, duration - 1),
    description: 'Enfermedad con Baja en la S.S',
    workCentre: 'MAD',
    warnings: [],
  };
}

describe('R1', () => {
  it('calcula una sola ventana inclusiva de doce meses', () => {
    expect(recurrenceWindowFor(localDate(2026, 7, 31))).toEqual({
      start: localDate(2025, 8, 1),
      end: localDate(2026, 7, 31),
    });
  });

  it('recorta la ventana cuando el corte cae en 29 de febrero', () => {
    expect(recurrenceWindowFor(localDate(2024, 2, 29))).toEqual({
      start: localDate(2023, 3, 1),
      end: localDate(2024, 2, 29),
    });
  });

  it('mantiene ventanas de 365 días con cortes de mes de 31 días', () => {
    expect(recurrenceWindowFor(localDate(2026, 1, 31))).toEqual({
      start: localDate(2025, 2, 1),
      end: localDate(2026, 1, 31),
    });
    expect(recurrenceWindowFor(localDate(2026, 12, 31))).toEqual({
      start: localDate(2026, 1, 1),
      end: localDate(2026, 12, 31),
    });
  });

  it('exige cinco episodios de hasta treinta días', () => {
    const episodes = [
      episode('000001', localDate(2026, 7, 1), 30, 'e1'),
      episode('000001', localDate(2026, 6, 1), 1, 'e2'),
      episode('000001', localDate(2026, 5, 1), 1, 'e3'),
      episode('000001', localDate(2026, 4, 1), 1, 'e4'),
      episode('000001', localDate(2026, 3, 1), 1, 'e5'),
      episode('000002', localDate(2026, 7, 1), 31, 'e6'),
      episode('000002', localDate(2026, 6, 1), 1, 'e7'),
      episode('000002', localDate(2026, 5, 1), 1, 'e8'),
      episode('000002', localDate(2026, 4, 1), 1, 'e9'),
      episode('000002', localDate(2026, 3, 1), 1, 'e10'),
    ];

    const result = findShortDurationRecurrences(episodes, localDate(2026, 7, 31));
    expect(result.map((candidate) => candidate.employeeId)).toEqual(['000001']);
    expect(result[0].episodeCount).toBe(5);
  });

  it('ordena por cantidad, recencia y nómina', () => {
    const episodes = [
      ...[1, 2, 3, 4, 5].map((day, index) =>
        episode('000002', localDate(2026, day, 1), 1, `a${index}`),
      ),
      ...[1, 2, 3, 4, 5].map((day, index) =>
        episode('000001', localDate(2026, day, 1), 1, `b${index}`),
      ),
      ...[1, 2, 3, 4, 5, 6].map((day, index) =>
        episode('000003', localDate(2026, day, 1), 1, `c${index}`),
      ),
    ];

    expect(
      findShortDurationRecurrences(episodes, localDate(2026, 7, 31)).map((item) => item.employeeId),
    ).toEqual(['000003', '000001', '000002']);
  });

  it('explica un episodio que intersecta pero empezó antes de la ventana', () => {
    const episodes = [
      episode('000001', localDate(2025, 7, 20), 20, 'old'),
      ...[1, 2, 3, 4, 5].map((month, index) =>
        episode('000001', localDate(2026, month, 1), 1, `e${index}`),
      ),
    ];

    const [candidate] = findShortDurationRecurrences(episodes, localDate(2026, 7, 31));
    const excluded = candidate.explanation.episodes.find((item) => item.episode.id === 'old');

    expect(excluded?.counted).toBe(false);
    expect(excluded?.reason).toBe('STARTED_BEFORE_WINDOW');
    expect(excluded?.daysInsideWindow).toBe(8);
    expect(excluded?.episode.warnings).toContain('INTERSECTS_WINDOW_FROM_BEFORE');
  });
});
