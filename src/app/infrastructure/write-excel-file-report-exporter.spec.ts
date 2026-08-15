import { describe, expect, it } from 'vitest';
import { CandidateReport } from '../application/report';
import { ReadExcelFileWorkbookReader } from './read-excel-file-workbook-reader';
import { WriteExcelFileReportExporter } from './write-excel-file-report-exporter';

describe('WriteExcelFileReportExporter', () => {
  it('genera un listado global de dos hojas que puede volver a leerse', async () => {
    const report: CandidateReport = {
      fileName: 'absence-lens-r1-2026-07-31.xlsx',
      sheets: [
        {
          name: 'Resumen',
          rows: [
            ['Campo', 'Valor'],
            ['Regla', 'R1-v1'],
          ],
        },
        { name: 'Candidatos', rows: [['Nº Nómina'], ['000001']] },
      ],
    };

    const blob = await new WriteExcelFileReportExporter().create(report);
    const workbook = await new ReadExcelFileWorkbookReader().read(
      new File([blob], report.fileName, { type: blob.type }),
    );

    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(workbook.sheets.map((sheet) => sheet.name)).toEqual(['Resumen', 'Candidatos']);
    expect(workbook.sheets[1].rows[1][0]).toBe('000001');
  });

  it('genera y relee una ficha individual', async () => {
    const report: CandidateReport = {
      fileName: 'absence-lens-ficha-r1-2026-07-31.xlsx',
      sheets: [
        {
          name: 'Ficha',
          rows: [
            ['Ficha de candidato', ''],
            ['Campo', 'Valor'],
            ['Nº Nómina', '000001'],
            [],
            ['Episodios médicos', ''],
            ['Descripción Ausencia', 'Duración efectiva'],
            ['Enfermedad con Baja en la S.S', 2],
          ],
          headerRows: [0, 1, 4, 5],
        },
      ],
    };

    const blob = await new WriteExcelFileReportExporter().create(report);
    const workbook = await new ReadExcelFileWorkbookReader().read(
      new File([blob], report.fileName, { type: blob.type }),
    );

    expect(workbook.sheets.map((sheet) => sheet.name)).toEqual(['Ficha']);
    expect(workbook.sheets[0].rows.flat()).not.toContain('Vacaciones');
  });
});
