import { AbsenceEpisode, EpisodeWarningCode } from '../domain/absence';
import { LocalDate, compareLocalDates } from '../domain/local-date';
import { ValidatedAbsenceRecord } from './import-profile';

const OPEN_END = { year: 2999, month: 12, day: 31 } satisfies LocalDate;

export interface NormalizationResult {
  readonly episodes: readonly AbsenceEpisode[];
  readonly warningCounts: Readonly<Record<EpisodeWarningCode, number>>;
}

export function normalizeAbsenceRecords(
  records: readonly ValidatedAbsenceRecord[],
  cutoff: LocalDate,
): NormalizationResult {
  const warningCounts: Record<EpisodeWarningCode, number> = {
    START_AFTER_CUTOFF: 0,
    END_AFTER_CUTOFF: 0,
    OPEN_END: 0,
    INTERSECTS_WINDOW_FROM_BEFORE: 0,
  };

  const episodes = records.map((record): AbsenceEpisode => {
    const warnings: EpisodeWarningCode[] = [];
    let effectiveEnd: LocalDate | null = record.end;

    if (compareLocalDates(record.start, cutoff) > 0) {
      effectiveEnd = null;
      warnings.push('START_AFTER_CUTOFF');
    } else if (compareLocalDates(record.end, OPEN_END) === 0) {
      effectiveEnd = cutoff;
      warnings.push('OPEN_END');
    } else if (compareLocalDates(record.end, cutoff) > 0) {
      effectiveEnd = cutoff;
      warnings.push('END_AFTER_CUTOFF');
    }

    warnings.forEach((warning) => {
      warningCounts[warning] += 1;
    });

    return {
      id: `row-${record.sourceRow}`,
      sourceRow: record.sourceRow,
      employeeId: record.employeeId,
      start: record.start,
      originalEnd: record.end,
      effectiveEnd,
      description: record.description,
      workCentre: record.locationCode,
      warnings,
    };
  });

  return { episodes, warningCounts };
}
