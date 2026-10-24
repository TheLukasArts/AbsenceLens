import { AbsenceEpisode } from '../domain/absence';
import { compareLocalDates } from '../domain/local-date';
import { LongDurationCandidate } from '../domain/long-duration';
import { CandidateMatch } from '../domain/recurrence';

export interface RecurrenceTableRow extends CandidateMatch {
  readonly locationCode: string;
}

export type RecurrenceSortColumn =
  'employeeId' | 'episodeCount' | 'locationCode' | 'mostRecentStart' | 'window';
export type LongDurationSortColumn =
  | 'employeeId'
  | 'maximumDuration'
  | 'start'
  | 'effectiveEnd'
  | 'workCentre'
  | 'longEpisodeCount'
  | 'status';
export type TableSortDirection = 'asc' | 'desc' | '';

export function buildRecurrenceTableRows(
  candidates: readonly CandidateMatch[],
): RecurrenceTableRow[] {
  return candidates.map((candidate) => {
    let latest: AbsenceEpisode | undefined;
    for (const { counted, episode } of candidate.explanation.episodes) {
      if (!counted) continue;
      if (
        !latest ||
        compareLocalDates(episode.start, latest.start) > 0 ||
        (compareLocalDates(episode.start, latest.start) === 0 &&
          episode.sourceRow < latest.sourceRow)
      ) {
        latest = episode;
      }
    }
    return { ...candidate, locationCode: latest?.workCentre ?? '' };
  });
}

export function sortRecurrenceTableRows(
  rows: readonly RecurrenceTableRow[],
  column: RecurrenceSortColumn | '',
  direction: TableSortDirection,
): RecurrenceTableRow[] {
  return stableSort(rows, direction, (left, right) => {
    switch (column) {
      case 'employeeId':
      case 'locationCode':
        return compareText(left[column], right[column]);
      case 'episodeCount':
        return left.episodeCount - right.episodeCount;
      case 'mostRecentStart':
        return compareLocalDates(left.mostRecentStart, right.mostRecentStart);
      case 'window':
        return (
          compareLocalDates(left.window.start, right.window.start) ||
          compareLocalDates(left.window.end, right.window.end)
        );
      case '':
        return 0;
    }
  });
}

export type LongEpisodeStatus = 'active' | 'finalized' | 'trimmed';

export function longEpisodeStatus(episode: AbsenceEpisode): LongEpisodeStatus {
  if (episode.warnings.includes('OPEN_END')) return 'active';
  if (episode.warnings.includes('END_AFTER_CUTOFF')) return 'trimmed';
  return 'finalized';
}

export function sortLongDurationTableRows(
  rows: readonly LongDurationCandidate[],
  column: LongDurationSortColumn | '',
  direction: TableSortDirection,
  statusLabels: Readonly<Record<LongEpisodeStatus, string>>,
): LongDurationCandidate[] {
  return stableSort(rows, direction, (left, right) => {
    switch (column) {
      case 'employeeId':
        return compareText(left.employeeId, right.employeeId);
      case 'maximumDuration':
      case 'longEpisodeCount':
        return left[column] - right[column];
      case 'start':
        return compareLocalDates(
          left.representativeEpisode.start,
          right.representativeEpisode.start,
        );
      case 'effectiveEnd': {
        const leftEnd = left.representativeEpisode.effectiveEnd;
        const rightEnd = right.representativeEpisode.effectiveEnd;
        return leftEnd && rightEnd
          ? compareLocalDates(leftEnd, rightEnd)
          : Number(!!leftEnd) - Number(!!rightEnd);
      }
      case 'workCentre':
        return compareText(
          left.representativeEpisode.workCentre,
          right.representativeEpisode.workCentre,
        );
      case 'status':
        return compareText(
          statusLabels[longEpisodeStatus(left.representativeEpisode)],
          statusLabels[longEpisodeStatus(right.representativeEpisode)],
        );
      case '':
        return 0;
    }
  });
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, 'es', { numeric: true, sensitivity: 'base' });
}

function stableSort<T>(
  rows: readonly T[],
  direction: TableSortDirection,
  compare: (left: T, right: T) => number,
): T[] {
  // Array.sort is stable: ties retain the rule's original order in both directions.
  if (!direction) return [...rows];
  return [...rows].sort((left, right) => (direction === 'asc' ? 1 : -1) * compare(left, right));
}
