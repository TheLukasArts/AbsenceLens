import { describe, expect, it } from 'vitest';
import {
  addDays,
  inclusiveDaysBetween,
  localDate,
  parseIsoDate,
  parseSpanishShortDate,
  subtractYearsClamped,
} from './local-date';

describe('LocalDate', () => {
  it('calcula duraciones inclusivas sin depender de zona horaria', () => {
    expect(inclusiveDaysBetween(localDate(2026, 7, 1), localDate(2026, 7, 1))).toBe(1);
    expect(inclusiveDaysBetween(localDate(2026, 7, 1), localDate(2026, 7, 30))).toBe(30);
  });

  it('atraviesa cambios de mes, año y año bisiesto', () => {
    expect(addDays(localDate(2024, 2, 28), 1)).toEqual(localDate(2024, 2, 29));
    expect(addDays(localDate(2024, 12, 31), 1)).toEqual(localDate(2025, 1, 1));
  });

  it('recorta el día al restar un año desde un 29 de febrero', () => {
    expect(subtractYearsClamped(localDate(2024, 2, 29), 1)).toEqual(localDate(2023, 2, 28));
  });

  it('acepta solo fechas ISO o españolas válidas', () => {
    expect(parseIsoDate('2026-07-31')).toEqual(localDate(2026, 7, 31));
    expect(parseSpanishShortDate('31/07/2026')).toEqual(localDate(2026, 7, 31));
    expect(parseSpanishShortDate('31/02/2026')).toBeNull();
  });
});
