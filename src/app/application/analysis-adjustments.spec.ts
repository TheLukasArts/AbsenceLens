import { describe, expect, it } from 'vitest';
import { AbsenceEpisode } from '../domain/absence';
import { summarizeAnalysisAdjustments } from './analysis-adjustments';

describe('resumen de ajustes del análisis', () => {
  it('agrupa únicamente episodios médicos y no expone una entrada por fila', () => {
    const medical = episode('medical', 'Enfermedad con Baja en la S.S', ['OPEN_END']);
    const vacation = episode('vacation', 'Vacaciones', ['OPEN_END']);

    expect(
      summarizeAnalysisAdjustments([medical, vacation], {
        start: { year: 2025, month: 8, day: 1 },
        end: { year: 2026, month: 7, day: 31 },
      }),
    ).toEqual([{ code: 'OPEN_END', count: 1 }]);
  });

  it('agrupa los episodios médicos que comenzaron antes de la ventana', () => {
    const medical = {
      ...episode('medical', 'Accidente Laboral', []),
      start: { year: 2025, month: 7, day: 20 },
      effectiveEnd: { year: 2025, month: 8, day: 2 },
    } satisfies AbsenceEpisode;

    expect(
      summarizeAnalysisAdjustments([medical], {
        start: { year: 2025, month: 8, day: 1 },
        end: { year: 2026, month: 7, day: 31 },
      }),
    ).toEqual([{ code: 'INTERSECTS_WINDOW_FROM_BEFORE', count: 1 }]);
  });
});

function episode(
  id: string,
  description: AbsenceEpisode['description'],
  warnings: AbsenceEpisode['warnings'],
): AbsenceEpisode {
  return {
    id,
    sourceRow: 2,
    employeeId: '000001',
    start: { year: 2026, month: 1, day: 1 },
    originalEnd: { year: 2999, month: 12, day: 31 },
    effectiveEnd: { year: 2026, month: 7, day: 31 },
    description,
    workCentre: 'MAD',
    warnings,
  };
}
