import { AbsenceEpisode, EpisodeWarningCode, isSicknessEpisode } from './absence';
import { LocalDate, compareLocalDates, inclusiveDaysBetween } from './local-date';

export interface ExplainedLongEpisode {
  readonly episode: AbsenceEpisode;
  readonly effectiveDuration: number;
  readonly representative: boolean;
}

export interface LongDurationExplanation {
  readonly ruleId: 'R2-v1';
  readonly employeeId: string;
  readonly cutoff: LocalDate;
  readonly threshold: 180;
  readonly episodes: readonly ExplainedLongEpisode[];
  readonly warnings: readonly EpisodeWarningCode[];
}

export interface LongDurationCandidate {
  readonly employeeId: string;
  readonly maximumDuration: number;
  readonly representativeEpisode: AbsenceEpisode;
  readonly longEpisodeCount: number;
  readonly explanation: LongDurationExplanation;
}

interface LongEpisode {
  readonly episode: AbsenceEpisode;
  readonly effectiveDuration: number;
}

export function buildLongDurationCandidates(
  episodes: readonly AbsenceEpisode[],
  cutoff: LocalDate,
): LongDurationCandidate[] {
  const grouped = new Map<string, LongEpisode[]>();

  for (const episode of episodes) {
    if (!isSicknessEpisode(episode) || episode.effectiveEnd === null) {
      continue;
    }

    const effectiveDuration = inclusiveDaysBetween(episode.start, episode.effectiveEnd);
    if (effectiveDuration < 180) {
      continue;
    }

    const employeeEpisodes = grouped.get(episode.employeeId) ?? [];
    employeeEpisodes.push({ episode, effectiveDuration });
    grouped.set(episode.employeeId, employeeEpisodes);
  }

  const candidates = [...grouped.entries()].map(([employeeId, employeeEpisodes]) => {
    const orderedEpisodes = [...employeeEpisodes].sort(compareLongEpisodes);
    const representative = orderedEpisodes[0];

    return {
      employeeId,
      maximumDuration: representative.effectiveDuration,
      representativeEpisode: representative.episode,
      longEpisodeCount: orderedEpisodes.length,
      explanation: {
        ruleId: 'R2-v1' as const,
        employeeId,
        cutoff,
        threshold: 180 as const,
        episodes: orderedEpisodes.map((item, index) => ({
          ...item,
          representative: index === 0,
        })),
        warnings: [
          ...new Set(orderedEpisodes.flatMap((item) => item.episode.warnings)),
        ] as EpisodeWarningCode[],
      },
    };
  });

  return candidates.sort(compareCandidates);
}

export function selectLongDurationTop(
  candidates: readonly LongDurationCandidate[],
  selectedCentres: ReadonlySet<string> = new Set<string>(),
  limit = 10,
): LongDurationCandidate[] {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error('INVALID_RESULT_LIMIT');
  }

  return candidates
    .filter(
      (candidate) =>
        selectedCentres.size === 0 ||
        selectedCentres.has(candidate.representativeEpisode.workCentre),
    )
    .slice(0, limit);
}

function compareLongEpisodes(left: LongEpisode, right: LongEpisode): number {
  const byDuration = right.effectiveDuration - left.effectiveDuration;
  if (byDuration !== 0) {
    return byDuration;
  }

  const byStart = compareLocalDates(right.episode.start, left.episode.start);
  if (byStart !== 0) {
    return byStart;
  }

  return left.episode.sourceRow - right.episode.sourceRow;
}

function compareCandidates(left: LongDurationCandidate, right: LongDurationCandidate): number {
  const byDuration = right.maximumDuration - left.maximumDuration;
  if (byDuration !== 0) {
    return byDuration;
  }

  const byStart = compareLocalDates(
    right.representativeEpisode.start,
    left.representativeEpisode.start,
  );
  if (byStart !== 0) {
    return byStart;
  }

  return left.employeeId < right.employeeId ? -1 : left.employeeId > right.employeeId ? 1 : 0;
}
