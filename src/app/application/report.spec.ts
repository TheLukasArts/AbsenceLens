import { describe, expect, it } from 'vitest';
import { localDate } from '../domain/local-date';
import { ReviewRow } from './review';
import {
  buildCandidateDetailReport,
  buildCandidateListReport,
  safeSpreadsheetText,
} from './report';

describe('candidate report', () => {
  it('exporta el listado global completo sin una hoja de registros', () => {
    const report = buildCandidateListReport({
      view: 'r1',
      cutoff: localDate(2026, 7, 31),
      filters: [{ column: 'locationCode', value: 'MAD' }],
      startFrom: localDate(2026, 1, 1),
      startTo: null,
      candidateTable: {
        headers: ['Nº Nómina', 'Episodios'],
        rows: [['000001', 5]],
      },
      warningCount: 2,
    });

    expect(report.fileName).toBe('absence-lens-r1-2026-07-31.xlsx');
    expect(report.sheets.map((sheet) => sheet.name)).toEqual(['Resumen', 'Candidatos']);
    expect(report.sheets[0].rows).toContainEqual(['Filtro: Ubicación - Código', 'MAD']);
    expect(report.sheets[1].rows[1]).toEqual(['000001', 5]);
  });

  it('crea una ficha individual y excluye vacaciones de forma defensiva', () => {
    const report = buildCandidateDetailReport({
      view: 'r1',
      cutoff: localDate(2026, 7, 31),
      employeeId: '000001',
      details: [['Episodios contabilizados', 5]],
      episodes: [
        { review: reviewRow, outcome: 'Contabilizado' },
        {
          review: { ...reviewRow, sourceRow: 3, description: 'Vacaciones' },
          outcome: 'No contabilizado',
        },
      ],
    });

    expect(report.fileName).toBe('absence-lens-ficha-r1-2026-07-31.xlsx');
    expect(report.sheets.map((sheet) => sheet.name)).toEqual(['Ficha']);
    expect(report.sheets[0].rows).toContainEqual(['Nº Nómina', '000001']);
    expect(report.sheets[0].rows.flat()).toContain('Enfermedad con Baja en la S.S');
    expect(report.sheets[0].rows.flat()).not.toContain('Vacaciones');
  });

  it('neutraliza textos que una hoja de cálculo podría interpretar como fórmulas', () => {
    expect(safeSpreadsheetText('=HYPERLINK("https://example.invalid")')).toBe(
      '\'=HYPERLINK("https://example.invalid")',
    );
    expect(safeSpreadsheetText('MAD')).toBe('MAD');
  });

  it('neutraliza fórmulas precedidas de espacio en blanco', () => {
    expect(safeSpreadsheetText('\t=1+1')).toBe("'=1+1");
    expect(safeSpreadsheetText('\r@SUM(A1)')).toBe("'@SUM(A1)");
    expect(safeSpreadsheetText('  +1')).toBe("'+1");
    expect(safeSpreadsheetText('  -1')).toBe("'-1");
  });
});

const reviewRow: ReviewRow = {
  sourceRow: 2,
  employeeId: '000001',
  activeStatus: 'Activo',
  laborAgreement: 'TI-15',
  start: localDate(2026, 1, 1),
  originalEnd: localDate(2026, 1, 2),
  effectiveEnd: localDate(2026, 1, 2),
  description: 'Enfermedad con Baja en la S.S',
  scope: 'PAX',
  birthDate: '15/07/1970',
  employeeType: 'FD',
  contractType: 'Fijo',
  salaryPlan: 'ADMINISTRATIVOS',
  sex: 'F',
  locationCode: 'MAD',
  effectiveDuration: 2,
  status: 'Finalizado',
};
