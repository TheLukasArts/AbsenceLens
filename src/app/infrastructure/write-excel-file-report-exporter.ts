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
        data: styledSheet(sheet.rows),
        stickyRowsCount: 1,
        columns: columnWidths(sheet.rows),
      })),
      { fontFamily: 'Aptos', fontSize: 10 },
    ).toBlob();
  }
}

function styledSheet(rows: readonly (readonly ReportCell[])[]): SheetData {
  return rows.map((row, rowIndex) =>
    row.map((value): Cell => {
      if (rowIndex === 0) {
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
  const columnCount = Math.max(0, ...rows.map((row) => row.length));
  return Array.from({ length: columnCount }, (_, columnIndex) => {
    const contentWidth = Math.max(
      10,
      ...rows.map((row) => String(row[columnIndex] ?? '').length + 2),
    );
    return { width: Math.min(contentWidth, 42) };
  });
}
