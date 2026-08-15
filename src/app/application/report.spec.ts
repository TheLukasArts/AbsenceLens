import { describe, expect, it } from 'vitest';
import { localDate } from '../domain/local-date';
import { ReviewRow } from './review';
import { buildCandidateReport, safeSpreadsheetText } from './report';

describe('candidate report', () => {
  it('construye las tres hojas para la vista activa y sus filtros', () => {
    const report = buildCandidateReport({
      view: 'r1',
      cutoff: localDate(2026, 7, 31),
      filters: [{ column: 'locationCode', value: 'MAD' }],
      startFrom: localDate(2026, 1, 1),
      startTo: null,
      candidateTable: {
        headers: ['Nº Nómina', 'Episodios'],
        rows: [['000001', 5]],
      },
      records: [reviewRow],
      warningCount: 2,
    });

    expect(report.fileName).toBe('absence-lens-r1-2026-07-31.xlsx');
    expect(report.sheets.map((sheet) => sheet.name)).toEqual([
      'Resumen',
      'Candidatos',
      'Registros',
    ]);
    expect(report.sheets[0].rows).toContainEqual(['Filtro: Ubicación - Código', 'MAD']);
    expect(report.sheets[1].rows[1]).toEqual(['000001', 5]);
    expect(report.sheets[2].rows[0]).not.toContain('Número de Días de Ausencia a Fecha de hoy');
  });

  it('neutraliza textos que una hoja de cálculo podría interpretar como fórmulas', () => {
    expect(safeSpreadsheetText('=HYPERLINK("https://example.invalid")')).toBe(
      '\'=HYPERLINK("https://example.invalid")',
    );
    expect(safeSpreadsheetText('MAD')).toBe('MAD');
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
