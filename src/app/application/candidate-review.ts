import { LongDurationCandidate } from '../domain/long-duration';
import { CandidateMatch } from '../domain/recurrence';

export type CandidateRule = 'R1' | 'R2';

export interface CandidateReviewSummary {
  readonly employeeId: string;
  readonly rules: readonly CandidateRule[];
  readonly recurrence: CandidateMatch | null;
  readonly longDuration: LongDurationCandidate | null;
}

export type CandidateReviewSortColumn =
  'employeeId' | 'rules' | 'episodeCount' | 'mostRecentStart' | 'maximumDuration' | 'workCentre';

export type CandidateReviewSortDirection = 'asc' | 'desc';

export function buildCandidateReviewSummaries(
  recurrenceCandidates: readonly CandidateMatch[],
  longDurationCandidates: readonly LongDurationCandidate[],
): CandidateReviewSummary[] {
  const summaries = new Map<string, CandidateReviewSummary>();

  for (const recurrence of recurrenceCandidates) {
    summaries.set(recurrence.employeeId, {
      employeeId: recurrence.employeeId,
      rules: ['R1'],
      recurrence,
      longDuration: null,
    });
  }

  for (const longDuration of longDurationCandidates) {
    const current = summaries.get(longDuration.employeeId);
    summaries.set(longDuration.employeeId, {
      employeeId: longDuration.employeeId,
      rules: current ? ['R1', 'R2'] : ['R2'],
      recurrence: current?.recurrence ?? null,
      longDuration,
    });
  }

  return [...summaries.values()].sort((left, right) =>
    left.employeeId.localeCompare(right.employeeId, 'es', { numeric: true }),
  );
}

export function sortCandidateReviewSummaries(
  rows: readonly CandidateReviewSummary[],
  column: CandidateReviewSortColumn,
  direction: CandidateReviewSortDirection,
): CandidateReviewSummary[] {
  return [...rows].sort((left, right) => {
    const leftMissing = isMissing(left, column);
    const rightMissing = isMissing(right, column);
    if (leftMissing !== rightMissing) return leftMissing ? 1 : -1;

    const result = compareSummary(left, right, column);
    const directed = direction === 'asc' ? result : -result;
    return directed || left.employeeId.localeCompare(right.employeeId, 'es', { numeric: true });
  });
}

function compareSummary(
  left: CandidateReviewSummary,
  right: CandidateReviewSummary,
  column: CandidateReviewSortColumn,
): number {
  switch (column) {
    case 'employeeId':
      return left.employeeId.localeCompare(right.employeeId, 'es', { numeric: true });
    case 'rules':
      return left.rules.join(' + ').localeCompare(right.rules.join(' + '), 'es');
    case 'episodeCount':
      return compareOptionalNumber(left.recurrence?.episodeCount, right.recurrence?.episodeCount);
    case 'mostRecentStart':
      return compareOptionalNumber(
        left.recurrence
          ? left.recurrence.mostRecentStart.year * 10_000 +
              left.recurrence.mostRecentStart.month * 100 +
              left.recurrence.mostRecentStart.day
          : undefined,
        right.recurrence
          ? right.recurrence.mostRecentStart.year * 10_000 +
              right.recurrence.mostRecentStart.month * 100 +
              right.recurrence.mostRecentStart.day
          : undefined,
      );
    case 'maximumDuration':
      return compareOptionalNumber(
        left.longDuration?.maximumDuration,
        right.longDuration?.maximumDuration,
      );
    case 'workCentre':
      return (left.longDuration?.representativeEpisode.workCentre ?? '').localeCompare(
        right.longDuration?.representativeEpisode.workCentre ?? '',
        'es',
      );
  }
}

function compareOptionalNumber(left: number | undefined, right: number | undefined): number {
  if (left === undefined) return right === undefined ? 0 : 1;
  if (right === undefined) return -1;
  return left - right;
}

function isMissing(row: CandidateReviewSummary, column: CandidateReviewSortColumn): boolean {
  switch (column) {
    case 'episodeCount':
    case 'mostRecentStart':
      return row.recurrence === null;
    case 'maximumDuration':
    case 'workCentre':
      return row.longDuration === null;
    case 'employeeId':
    case 'rules':
      return false;
  }
}
