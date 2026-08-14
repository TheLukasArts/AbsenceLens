import { Injectable } from '@angular/core';
import { LocalDate, localDate } from '../domain/local-date';

export interface Clock {
  today(): LocalDate;
}

@Injectable({ providedIn: 'root' })
export class SystemClock implements Clock {
  today(): LocalDate {
    const now = new Date();
    return localDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}

export function lastCompleteMonthCutoff(today: LocalDate): LocalDate {
  const year = today.month === 1 ? today.year - 1 : today.year;
  const month = today.month === 1 ? 12 : today.month - 1;
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return localDate(year, month, day);
}
