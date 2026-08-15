import { Injectable } from '@angular/core';
import { isSicknessDescription } from '../domain/absence';
import { LocalDate, formatIsoDate, formatSpanishDate } from '../domain/local-date';
import { ReviewColumnFilter, ReviewRow, reviewColumnLabel, reviewValue } from './review';

export type ReportCell = string | number | boolean | null;

export interface ReportSheet {
  readonly name: string;
  readonly rows: readonly (readonly ReportCell[])[];
  readonly headerRows?: readonly number[];
  readonly stickyRowsCount?: number;
}

export interface CandidateReport {
  readonly fileName: string;
  readonly sheets: readonly ReportSheet[];
}

export interface CandidateTable {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly ReportCell[])[];
}

export interface CandidateListReportInput {
  readonly view: 'r1' | 'r2';
  readonly cutoff: LocalDate;
  readonly filters: readonly ReviewColumnFilter[];
  readonly startFrom: LocalDate | null;
  readonly startTo: LocalDate | null;
  readonly candidateTable: CandidateTable;
  readonly warningCount: number;
}

export interface CandidateEpisodeReportRow {
  readonly review: ReviewRow;
  readonly outcome: string;
}

export interface CandidateDetailReportInput {
  readonly view: 'r1' | 'r2';
  readonly cutoff: LocalDate;
  readonly employeeId: string;
  readonly details: readonly (readonly [string, ReportCell])[];
  readonly episodes: readonly CandidateEpisodeReportRow[];
}

@Injectable()
export abstract class CandidateReportExporter {
  abstract create(report: CandidateReport): Promise<Blob>;
}

export function buildCandidateListReport(input: CandidateListReportInput): CandidateReport {
  const rule = input.view === 'r1' ? 'R1-v1 — recurrencia corta' : 'R2-v1 — larga duración';
  const filterRows = input.filters.map((filter) => [
    `Filtro: ${reviewColumnLabel(filter.column)}`,
    safeSpreadsheetText(filter.value),
  ]);

  const summaryRows: ReportCell[][] = [
    ['Campo', 'Valor'],
    ['Regla', rule],
    ['Fecha de corte', formatSpanishDate(input.cutoff)],
    ['Candidatos visibles', input.candidateTable.rows.length],
    ['Advertencias agregadas', input.warningCount],
    ['Inicio desde', input.startFrom ? formatSpanishDate(input.startFrom) : 'Sin filtro'],
    ['Inicio hasta', input.startTo ? formatSpanishDate(input.startTo) : 'Sin filtro'],
    ...(filterRows.length > 0 ? filterRows : [['Filtros adicionales', 'Ninguno']]),
  ];

  const candidateRows: ReportCell[][] = [
    [...input.candidateTable.headers],
    ...input.candidateTable.rows.map((row) => row.map(sanitizeReportCell)),
  ];

  return {
    fileName: `absence-lens-${input.view}-${formatIsoDate(input.cutoff)}.xlsx`,
    sheets: [
      { name: 'Resumen', rows: summaryRows, headerRows: [0], stickyRowsCount: 1 },
      { name: 'Candidatos', rows: candidateRows, headerRows: [0], stickyRowsCount: 1 },
    ],
  };
}

export function buildCandidateDetailReport(input: CandidateDetailReportInput): CandidateReport {
  const rule = input.view === 'r1' ? 'R1-v1 — recurrencia corta' : 'R2-v1 — larga duración';
  const episodes = input.episodes.filter((item) => isSicknessDescription(item.review.description));
  const episodeHeaderIndex = 7 + input.details.length;
  const rows: ReportCell[][] = [
    ['Ficha de candidato', ''],
    ['Campo', 'Valor'],
    ['Regla', rule],
    ['Fecha de corte', formatSpanishDate(input.cutoff)],
    ['Nº Nómina', safeSpreadsheetText(input.employeeId)],
    ...input.details.map(([label, value]) => [
      safeSpreadsheetText(label),
      sanitizeReportCell(value),
    ]),
    [],
    ['Episodios médicos', ''],
    [
      'Fecha Inicio Ausencia',
      'Fecha Fin Ausencia',
      'Final efectivo',
      'Descripción Ausencia',
      'Ubicación - Código',
      'Duración efectiva',
      'Estado del episodio',
      'Clasificación',
    ],
    ...episodes.map(({ review, outcome }) => [
      reviewValue(review, 'start'),
      reviewValue(review, 'originalEnd'),
      reviewValue(review, 'effectiveEnd'),
      safeSpreadsheetText(review.description),
      safeSpreadsheetText(review.locationCode),
      review.effectiveDuration,
      safeSpreadsheetText(review.status),
      safeSpreadsheetText(outcome),
    ]),
  ];

  return {
    fileName: `absence-lens-ficha-${input.view}-${formatIsoDate(input.cutoff)}.xlsx`,
    sheets: [
      {
        name: 'Ficha',
        rows,
        headerRows: [0, 1, episodeHeaderIndex - 1, episodeHeaderIndex],
      },
    ],
  };
}

export function safeSpreadsheetText(value: string): string {
  const text = value.trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function sanitizeReportCell(value: ReportCell): ReportCell {
  return typeof value === 'string' ? safeSpreadsheetText(value) : value;
}
