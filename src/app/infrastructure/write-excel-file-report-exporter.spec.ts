import { describe, expect, it } from 'vitest';
import { CandidateReport } from '../application/report';
import { ReadExcelFileWorkbookReader } from './read-excel-file-workbook-reader';
import { WriteExcelFileReportExporter } from './write-excel-file-report-exporter';

describe('WriteExcelFileReportExporter', () => {
  it('genera un libro de tres hojas que puede volver a leerse', async () => {
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
        {
          name: 'Registros',
          rows: [
            ['Nº Nómina', 'Duración efectiva'],
            ['000001', 2],
          ],
        },
      ],
    };

    const blob = await new WriteExcelFileReportExporter().create(report);
    const workbook = await new ReadExcelFileWorkbookReader().read(
      new File([blob], report.fileName, { type: blob.type }),
    );

    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(workbook.sheets.map((sheet) => sheet.name)).toEqual([
      'Resumen',
      'Candidatos',
      'Registros',
    ]);
    expect(workbook.sheets[1].rows[1][0]).toBe('000001');
    expect(workbook.sheets[2].rows[0]).not.toContain('Número de Días de Ausencia a Fecha de hoy');
  });
});
