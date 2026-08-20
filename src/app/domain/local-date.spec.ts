import { describe, expect, it } from 'vitest';
import {
  addDays,
  fromSpreadsheetDate,
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

  it('lee la fecha del Excel en UTC, no en la zona horaria del navegador', () => {
    // read-excel-file entrega la celda como medianoche UTC del día real.
    expect(fromSpreadsheetDate(new Date(Date.UTC(2026, 6, 31)))).toEqual(localDate(2026, 7, 31));
    expect(fromSpreadsheetDate(new Date(Date.UTC(2026, 0, 1)))).toEqual(localDate(2026, 1, 1));
  });

  it('rechaza una duración con final anterior al inicio', () => {
    expect(() => inclusiveDaysBetween(localDate(2026, 7, 10), localDate(2026, 7, 9))).toThrowError(
      'END_BEFORE_START',
    );
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
