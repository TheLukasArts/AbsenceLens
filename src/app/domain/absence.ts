import { LocalDate } from './local-date';

export const ABSENCE_DESCRIPTIONS = [
  'Vacaciones',
  'Enfermedad con Baja en la S.S',
  'Accidente Laboral',
  'Ampliacion Incapacidad Temp',
] as const;

export type AbsenceDescription = (typeof ABSENCE_DESCRIPTIONS)[number];

export type EpisodeWarningCode =
  'START_AFTER_CUTOFF' | 'END_AFTER_CUTOFF' | 'OPEN_END' | 'INTERSECTS_WINDOW_FROM_BEFORE';

export interface AbsenceEpisode {
  readonly id: string;
  readonly sourceRow: number;
  readonly employeeId: string;
  readonly start: LocalDate;
  readonly originalEnd: LocalDate;
  readonly effectiveEnd: LocalDate | null;
  readonly description: AbsenceDescription;
  readonly workCentre: string;
  readonly warnings: readonly EpisodeWarningCode[];
}

export function isSicknessEpisode(episode: AbsenceEpisode): boolean {
  return episode.description !== 'Vacaciones';
}
