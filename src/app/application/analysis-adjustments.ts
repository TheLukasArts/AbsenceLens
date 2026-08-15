import { AbsenceEpisode, EpisodeWarningCode, isSicknessEpisode } from '../domain/absence';
import { compareLocalDates } from '../domain/local-date';
import { RecurrenceWindow } from '../domain/recurrence';

export interface AnalysisAdjustment {
  readonly code: EpisodeWarningCode;
  readonly count: number;
}

const ADJUSTMENT_ORDER: readonly EpisodeWarningCode[] = [
  'OPEN_END',
  'END_AFTER_CUTOFF',
  'START_AFTER_CUTOFF',
  'INTERSECTS_WINDOW_FROM_BEFORE',
];

export function summarizeAnalysisAdjustments(
  episodes: readonly AbsenceEpisode[],
  recurrenceWindow: RecurrenceWindow,
): AnalysisAdjustment[] {
  const counts = new Map<EpisodeWarningCode, number>();

  for (const episode of episodes) {
    if (!isSicknessEpisode(episode)) continue;

    for (const warning of episode.warnings) {
      counts.set(warning, (counts.get(warning) ?? 0) + 1);
    }

    if (
      episode.effectiveEnd !== null &&
      compareLocalDates(episode.start, recurrenceWindow.start) < 0 &&
      compareLocalDates(episode.effectiveEnd, recurrenceWindow.start) >= 0
    ) {
      counts.set(
        'INTERSECTS_WINDOW_FROM_BEFORE',
        (counts.get('INTERSECTS_WINDOW_FROM_BEFORE') ?? 0) + 1,
      );
    }
  }

  return ADJUSTMENT_ORDER.flatMap((code) => {
    const count = counts.get(code) ?? 0;
    return count > 0 ? [{ code, count }] : [];
  });
}
