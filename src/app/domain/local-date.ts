export interface LocalDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

const DAY_IN_MS = 86_400_000;

export function localDate(year: number, month: number, day: number): LocalDate {
  const value = { year, month, day };
  if (!isValidLocalDate(value)) {
    throw new Error('INVALID_LOCAL_DATE');
  }
  return value;
}

export function isValidLocalDate(value: LocalDate): boolean {
  if (
    !Number.isInteger(value.year) ||
    !Number.isInteger(value.month) ||
    !Number.isInteger(value.day) ||
    value.year < 1 ||
    value.year > 9999
  ) {
    return false;
  }

  const date = new Date(Date.UTC(value.year, value.month - 1, value.day));
  return (
    date.getUTCFullYear() === value.year &&
    date.getUTCMonth() + 1 === value.month &&
    date.getUTCDate() === value.day
  );
}

export function compareLocalDates(left: LocalDate, right: LocalDate): number {
  return toEpochDay(left) - toEpochDay(right);
}

export function inclusiveDaysBetween(start: LocalDate, end: LocalDate): number {
  const days = toEpochDay(end) - toEpochDay(start) + 1;
  if (days < 1) {
    throw new Error('END_BEFORE_START');
  }
  return days;
}

export function addDays(value: LocalDate, days: number): LocalDate {
  const date = new Date((toEpochDay(value) + days) * DAY_IN_MS);
  return localDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function subtractYearsClamped(value: LocalDate, years: number): LocalDate {
  const targetYear = value.year - years;
  const lastDay = new Date(Date.UTC(targetYear, value.month, 0)).getUTCDate();
  return localDate(targetYear, value.month, Math.min(value.day, lastDay));
}

export function minLocalDate(left: LocalDate, right: LocalDate): LocalDate {
  return compareLocalDates(left, right) <= 0 ? left : right;
}

export function maxLocalDate(left: LocalDate, right: LocalDate): LocalDate {
  return compareLocalDates(left, right) >= 0 ? left : right;
}

export function formatIsoDate(value: LocalDate): string {
  return `${value.year.toString().padStart(4, '0')}-${value.month
    .toString()
    .padStart(2, '0')}-${value.day.toString().padStart(2, '0')}`;
}

export function formatSpanishDate(value: LocalDate): string {
  return `${value.day.toString().padStart(2, '0')}/${value.month
    .toString()
    .padStart(2, '0')}/${value.year.toString().padStart(4, '0')}`;
}

export function parseIsoDate(value: string): LocalDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  return match ? tryLocalDate(Number(match[1]), Number(match[2]), Number(match[3])) : null;
}

export function parseSpanishShortDate(value: string): LocalDate | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim());
  return match ? tryLocalDate(Number(match[3]), Number(match[2]), Number(match[1])) : null;
}

// La librería de lectura construye la fecha del Excel en UTC+0, así que hay que leerla en UTC.
export function fromSpreadsheetDate(value: Date): LocalDate | null {
  return tryLocalDate(value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate());
}

function tryLocalDate(year: number, month: number, day: number): LocalDate | null {
  const candidate = { year, month, day };
  return isValidLocalDate(candidate) ? candidate : null;
}

function toEpochDay(value: LocalDate): number {
  return Math.floor(Date.UTC(value.year, value.month - 1, value.day) / DAY_IN_MS);
}
