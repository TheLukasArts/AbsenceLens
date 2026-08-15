import { describe, expect, it } from 'vitest';
import { LongDurationCandidate } from '../domain/long-duration';
import { CandidateMatch } from '../domain/recurrence';
import { buildCandidateReviewSummaries, sortCandidateReviewSummaries } from './candidate-review';

describe('resumen combinado de revisión', () => {
  it('presenta una sola fila cuando el empleado cumple R1 y R2', () => {
    const recurrence = { employeeId: '000001' } as CandidateMatch;
    const longDuration = { employeeId: '000001' } as LongDurationCandidate;

    const rows = buildCandidateReviewSummaries([recurrence], [longDuration]);

    expect(rows).toHaveLength(1);
    expect(rows[0].rules).toEqual(['R1', 'R2']);
    expect(rows[0].recurrence).toBe(recurrence);
    expect(rows[0].longDuration).toBe(longDuration);
  });

  it('ordena valores calculados y conserva los no aplicables al final', () => {
    const first = {
      employeeId: '000001',
      rules: ['R1'] as const,
      recurrence: { episodeCount: 8 } as CandidateMatch,
      longDuration: null,
    };
    const second = {
      employeeId: '000002',
      rules: ['R2'] as const,
      recurrence: null,
      longDuration: null,
    };

    expect(
      sortCandidateReviewSummaries([second, first], 'episodeCount', 'desc').map(
        (row) => row.employeeId,
      ),
    ).toEqual(['000001', '000002']);
  });
});
