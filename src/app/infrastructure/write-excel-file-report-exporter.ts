import { Injectable } from '@angular/core';
import writeExcelFile, { Cell, SheetData } from 'write-excel-file/universal';
import { CandidateReport, CandidateReportExporter, ReportCell } from '../application/report';

const HEADER_BACKGROUND = '#075363';
const HEADER_TEXT = '#FFFFFF';

@Injectable({ providedIn: 'root' })
export class WriteExcelFileReportExporter extends CandidateReportExporter {
  async create(report: CandidateReport): Promise<Blob> {
    return writeExcelFile(
      report.sheets.map((sheet) => ({
        sheet: sheet.name,
        data: styledSheet(sheet.rows, new Set(sheet.headerRows ?? [0])),
        stickyRowsCount: sheet.stickyRowsCount ?? 0,
        columns: columnWidths(sheet.rows),
      })),
      { fontFamily: 'Aptos', fontSize: 10 },
    ).toBlob();
  }
}

function styledSheet(
  rows: readonly (readonly ReportCell[])[],
  headerRows: ReadonlySet<number>,
): SheetData {
  return rows.map((row, rowIndex) =>
    row.map((value): Cell => {
      if (headerRows.has(rowIndex)) {
        return {
          value: value ?? '',
          fontWeight: 'bold',
          backgroundColor: HEADER_BACKGROUND,
          textColor: HEADER_TEXT,
        };
      }
      return value;
    }),
  );
}

function columnWidths(rows: readonly (readonly ReportCell[])[]): { width: number }[] {
  const columnCount = rows.reduce((widest, row) => Math.max(widest, row.length), 0);
  return Array.from({ length: columnCount }, (_, columnIndex) => {
    const contentWidth = rows.reduce(
      (widest, row) => Math.max(widest, String(row[columnIndex] ?? '').length + 2),
      10,
    );
    return { width: Math.min(contentWidth, 42) };
  });
}
