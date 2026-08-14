import { AbsenceEpisode, EpisodeWarningCode, isSicknessEpisode } from './absence';
import {
  LocalDate,
  addDays,
  compareLocalDates,
  inclusiveDaysBetween,
  maxLocalDate,
  minLocalDate,
  subtractYearsClamped,
} from './local-date';

export interface RecurrenceWindow {
  readonly start: LocalDate;
  readonly end: LocalDate;
}

export type EpisodeExclusionReason =
  'COUNTED' | 'LONGER_THAN_30_DAYS' | 'STARTED_BEFORE_WINDOW' | 'STARTED_AFTER_CUTOFF';

export interface ExplainedEpisode {
  readonly episode: AbsenceEpisode;
  readonly effectiveDuration: number | null;
  readonly daysInsideWindow: number;
  readonly counted: boolean;
  readonly reason: EpisodeExclusionReason;
}

export interface MatchExplanation {
  readonly ruleId: 'R1-v1';
  readonly employeeId: string;
  readonly cutoff: LocalDate;
  readonly window: RecurrenceWindow;
  readonly threshold: 5;
  readonly maximumShortDuration: 30;
  readonly episodes: readonly ExplainedEpisode[];
  readonly warnings: readonly EpisodeWarningCode[];
}

export interface CandidateMatch {
  readonly employeeId: string;
  readonly episodeCount: number;
  readonly mostRecentStart: LocalDate;
  readonly window: RecurrenceWindow;
  readonly explanation: MatchExplanation;
}

export function recurrenceWindowFor(cutoff: LocalDate): RecurrenceWindow {
  return {
    start: addDays(subtractYearsClamped(cutoff, 1), 1),
    end: cutoff,
  };
}

export function findShortDurationRecurrences(
  episodes: readonly AbsenceEpisode[],
  cutoff: LocalDate,
): CandidateMatch[] {
  const window = recurrenceWindowFor(cutoff);
  const grouped = new Map<string, AbsenceEpisode[]>();

  for (const episode of episodes) {
    if (!isSicknessEpisode(episode)) {
      continue;
    }
    const employeeEpisodes = grouped.get(episode.employeeId) ?? [];
    employeeEpisodes.push(episode);
    grouped.set(episode.employeeId, employeeEpisodes);
  }

  const candidates: CandidateMatch[] = [];

  for (const [employeeId, employeeEpisodes] of grouped) {
    const explained = employeeEpisodes
      .map((episode) => explainEpisode(episode, window))
      .sort((left, right) => compareLocalDates(right.episode.start, left.episode.start));

    const counted = explained.filter((item) => item.counted);
    if (counted.length < 5) {
      continue;
    }

    candidates.push({
      employeeId,
      episodeCount: counted.length,
      mostRecentStart: counted[0].episode.start,
      window,
      explanation: {
        ruleId: 'R1-v1',
        employeeId,
        cutoff,
        window,
        threshold: 5,
        maximumShortDuration: 30,
        episodes: explained,
        warnings: [...new Set(explained.flatMap((item) => item.episode.warnings))],
      },
    });
  }

  return candidates.sort((left, right) => {
    const byCount = right.episodeCount - left.episodeCount;
    if (byCount !== 0) {
      return byCount;
    }

    const byRecent = compareLocalDates(right.mostRecentStart, left.mostRecentStart);
    if (byRecent !== 0) {
      return byRecent;
    }

    return left.employeeId < right.employeeId ? -1 : left.employeeId > right.employeeId ? 1 : 0;
  });
}

function explainEpisode(episode: AbsenceEpisode, window: RecurrenceWindow): ExplainedEpisode {
  if (episode.effectiveEnd === null) {
    return {
      episode,
      effectiveDuration: null,
      daysInsideWindow: 0,
      counted: false,
      reason: 'STARTED_AFTER_CUTOFF',
    };
  }

  const effectiveDuration = inclusiveDaysBetween(episode.start, episode.effectiveEnd);
  const intersects =
    compareLocalDates(episode.start, window.end) <= 0 &&
    compareLocalDates(episode.effectiveEnd, window.start) >= 0;
  const daysInsideWindow = intersects
    ? inclusiveDaysBetween(
        maxLocalDate(episode.start, window.start),
        minLocalDate(episode.effectiveEnd, window.end),
      )
    : 0;

  if (compareLocalDates(episode.start, window.start) < 0) {
    const explainedEpisode = intersects
      ? {
          ...episode,
          warnings: [...episode.warnings, 'INTERSECTS_WINDOW_FROM_BEFORE'] as const,
        }
      : episode;

    return {
      episode: explainedEpisode,
      effectiveDuration,
      daysInsideWindow,
      counted: false,
      reason: 'STARTED_BEFORE_WINDOW',
    };
  }

  if (effectiveDuration > 30) {
    return {
      episode,
      effectiveDuration,
      daysInsideWindow,
      counted: false,
      reason: 'LONGER_THAN_30_DAYS',
    };
  }

  return {
    episode,
    effectiveDuration,
    daysInsideWindow,
    counted: true,
    reason: 'COUNTED',
  };
}
