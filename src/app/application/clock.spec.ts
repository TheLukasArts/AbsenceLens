import { describe, expect, it } from 'vitest';
import { localDate } from '../domain/local-date';
import { lastCompleteMonthCutoff } from './clock';

describe('fecha de corte predeterminada', () => {
  it('usa el último día del mes completo anterior', () => {
    expect(lastCompleteMonthCutoff(localDate(2026, 8, 14))).toEqual(localDate(2026, 7, 31));
    expect(lastCompleteMonthCutoff(localDate(2026, 1, 5))).toEqual(localDate(2025, 12, 31));
    expect(lastCompleteMonthCutoff(localDate(2024, 3, 1))).toEqual(localDate(2024, 2, 29));
  });
});
