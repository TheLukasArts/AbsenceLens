import { Injectable } from '@angular/core';
import { LocalDate, formatIsoDate, formatSpanishDate } from '../domain/local-date';
import { ReviewColumnFilter, ReviewRow, reviewColumnLabel, reviewValue } from './review';

export type ReportCell = string | number | boolean | null;

export interface ReportSheet {
  readonly name: 'Resumen' | 'Candidatos' | 'Registros';
  readonly rows: readonly (readonly ReportCell[])[];
}

export interface CandidateReport {
  readonly fileName: string;
  readonly sheets: readonly ReportSheet[];
}

export interface CandidateTable {
  readonly headers: readonly string[];
  readonly rows: readonly (readonly ReportCell[])[];
}

export interface CandidateReportInput {
  readonly view: 'r1' | 'r2';
  readonly cutoff: LocalDate;
  readonly filters: readonly ReviewColumnFilter[];
  readonly startFrom: LocalDate | null;
  readonly startTo: LocalDate | null;
  readonly candidateTable: CandidateTable;
  readonly records: readonly ReviewRow[];
  readonly warningCount: number;
}

@Injectable()
export abstract class CandidateReportExporter {
  abstract create(report: CandidateReport): Promise<Blob>;
}

export function buildCandidateReport(input: CandidateReportInput): CandidateReport {
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
    ['Registros visibles', input.records.length],
    ['Advertencias agregadas', input.warningCount],
    ['Inicio desde', input.startFrom ? formatSpanishDate(input.startFrom) : 'Sin filtro'],
    ['Inicio hasta', input.startTo ? formatSpanishDate(input.startTo) : 'Sin filtro'],
    ...(filterRows.length > 0 ? filterRows : [['Filtros adicionales', 'Ninguno']]),
  ];

  const candidateRows: ReportCell[][] = [
    [...input.candidateTable.headers],
    ...input.candidateTable.rows.map((row) => row.map(sanitizeReportCell)),
  ];

  const recordHeaders = [
    'Nº Nómina',
    'Activo/Inactivo',
    'Convenio Laboral',
    'Fecha Inicio Ausencia',
    'Fecha Fin Ausencia',
    'Final efectivo',
    'Descripción Ausencia',
    'Ambito',
    'Fecha Nacimiento',
    'Tipo de Empleado',
    'Fijo/Temporal',
    'Plan Salarial - Desc.',
    'Sexo',
    'Ubicación - Código',
    'Duración efectiva',
    'Estado del episodio',
    'Fila de origen',
  ];

  const recordRows: ReportCell[][] = [
    recordHeaders,
    ...input.records.map((row) => [
      safeSpreadsheetText(row.employeeId),
      safeSpreadsheetText(row.activeStatus),
      safeSpreadsheetText(row.laborAgreement),
      reviewValue(row, 'start'),
      reviewValue(row, 'originalEnd'),
      reviewValue(row, 'effectiveEnd'),
      safeSpreadsheetText(row.description),
      safeSpreadsheetText(row.scope),
      safeSpreadsheetText(row.birthDate),
      safeSpreadsheetText(row.employeeType),
      safeSpreadsheetText(row.contractType),
      safeSpreadsheetText(row.salaryPlan),
      safeSpreadsheetText(row.sex),
      safeSpreadsheetText(row.locationCode),
      row.effectiveDuration,
      safeSpreadsheetText(row.status),
      row.sourceRow,
    ]),
  ];

  return {
    fileName: `absence-lens-${input.view}-${formatIsoDate(input.cutoff)}.xlsx`,
    sheets: [
      { name: 'Resumen', rows: summaryRows },
      { name: 'Candidatos', rows: candidateRows },
      { name: 'Registros', rows: recordRows },
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
