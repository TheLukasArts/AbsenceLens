import { Injectable } from '@angular/core';
import readWorkbook from 'read-excel-file/browser';
import { WorkbookData, WorkbookReader } from '../application/workbook';

@Injectable({ providedIn: 'root' })
export class ReadExcelFileWorkbookReader implements WorkbookReader {
  async read(file: File): Promise<WorkbookData> {
    const sheets = await readWorkbook(file);
    return {
      sheets: sheets.map((sheet) => ({
        name: sheet.sheet,
        rows: sheet.data.map((row) => row.map((cell) => cell as unknown)),
      })) as WorkbookData['sheets'],
    };
  }
}
