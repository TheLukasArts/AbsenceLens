import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { EXPECTED_HEADERS } from './application/import-profile';
import { CandidateReport } from './application/report';
import { WorkbookCell, WorkbookData } from './application/workbook';
import { BrowserDownload } from './infrastructure/browser-download';
import { ReadExcelFileWorkbookReader } from './infrastructure/read-excel-file-workbook-reader';
import { WriteExcelFileReportExporter } from './infrastructure/write-excel-file-report-exporter';
import { App } from './app';

describe('App', () => {
  it('crea la aplicación', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('explica el procesamiento local y ofrece los flujos R1 y R2', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Tu archivo no sale del dispositivo');
    expect(text).toContain('Ejecutar análisis');
    expect(text).toContain('R1-v1');
    expect(text).toContain('R2-v1');
    expect(text).toContain('Eliminar sesión');
  });

  it('importa, analiza, explica R1 y elimina una sesión con teclado', async () => {
    const root = await importWorkbook(buildWorkbook());

    expect(root.textContent).toContain('5 filas válidas');
    setCutoff(root);
    findButton(root, 'Ejecutar análisis').click();
    detectChanges();

    expect(root.textContent).toContain('000001');
    expect(root.textContent).toContain('1 coincidencias R1');

    findButton(root, 'Ver explicación').click();
    detectChanges();
    const dialog = root.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain('R1-v1');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    detectChanges();
    expect(root.querySelector('[role="dialog"]')).toBeNull();

    findButton(root, 'Eliminar sesión').click();
    detectChanges();
    expect(root.textContent).toContain('Sesión eliminada');
    expect(root.textContent).not.toContain('000001');
  });

  it('muestra, filtra y explica R2 sin volver a importar', async () => {
    const root = await importWorkbook(buildWorkbookWithLongDurations());
    setCutoff(root);
    findButton(root, 'Ejecutar análisis').click();
    detectChanges();

    findButton(root, 'Larga duración').click();
    detectChanges();

    expect(root.textContent).toContain('000010');
    expect(root.textContent).toContain('000011');
    expect(root.textContent).toContain('000012');

    const bcnFilter = [...root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].find(
      (input) => input.parentElement?.textContent?.includes('BCN'),
    )!;
    bcnFilter.checked = true;
    bcnFilter.dispatchEvent(new Event('change', { bubbles: true }));
    detectChanges();

    expect(root.textContent).not.toContain('000010');
    expect(root.textContent).toContain('000011');
    expect(root.textContent).toContain('000012');

    findButton(root, 'Ver explicación').click();
    detectChanges();
    const dialog = root.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain('R2-v1');
    expect(dialog.textContent).toContain('Episodio representativo');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    detectChanges();
    expect(root.querySelector('[role="dialog"]')).toBeNull();

    expect(readWorkbook).toHaveBeenCalledOnce();
  });

  it('filtra la revisión y exporta únicamente la vista activa', async () => {
    const root = await importWorkbook(buildWorkbookWithLongDurations());
    setCutoff(root);
    findButton(root, 'Ejecutar análisis').click();
    detectChanges();
    findButton(root, 'Larga duración').click();
    detectChanges();

    const column = root.querySelector<HTMLSelectElement>('[data-testid="review-filter-column"]')!;
    column.value = 'locationCode';
    column.dispatchEvent(new Event('change', { bubbles: true }));
    const value = root.querySelector<HTMLInputElement>('[data-testid="review-filter-value"]')!;
    value.value = 'BCN';
    value.dispatchEvent(new Event('input', { bubbles: true }));
    detectChanges();
    findButton(root, 'Añadir filtro').click();
    detectChanges();

    expect(root.textContent).not.toContain('000010');
    expect(root.textContent).toContain('Ubicación - Código: BCN');
    expect(root.textContent).toContain('empleados · 2 registros');

    root.querySelector<HTMLButtonElement>('[data-testid="export-report"]')!.click();
    await activeFixture.whenStable();
    detectChanges();

    expect(createReport).toHaveBeenCalledOnce();
    const report = createReport.mock.calls[0][0] as CandidateReport;
    expect(report.sheets.map((sheet) => sheet.name)).toEqual([
      'Resumen',
      'Candidatos',
      'Registros',
    ]);
    expect(report.sheets[1].rows).toHaveLength(3);
    expect(report.sheets[2].rows).toHaveLength(3);
    expect(saveDownload).toHaveBeenCalledWith(expect.any(Blob), report.fileName);
  });
});

let activeFixture: ReturnType<typeof TestBed.createComponent<App>>;
let readWorkbook: ReturnType<typeof vi.fn>;
let createReport: ReturnType<typeof vi.fn>;
let saveDownload: ReturnType<typeof vi.fn>;

async function importWorkbook(workbook: WorkbookData): Promise<HTMLElement> {
  readWorkbook = vi.fn().mockResolvedValue(workbook);
  createReport = vi.fn().mockResolvedValue(new Blob(['synthetic-report']));
  saveDownload = vi.fn();
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [
      { provide: ReadExcelFileWorkbookReader, useValue: { read: readWorkbook } },
      { provide: WriteExcelFileReportExporter, useValue: { create: createReport } },
      { provide: BrowserDownload, useValue: { save: saveDownload } },
    ],
  }).compileComponents();

  activeFixture = TestBed.createComponent(App);
  activeFixture.detectChanges();
  const root = activeFixture.nativeElement as HTMLElement;
  const fileInput = root.querySelector<HTMLInputElement>('input[type="file"]')!;
  const file = new File(['synthetic'], 'synthetic.xlsx');
  Object.defineProperty(fileInput, 'files', {
    configurable: true,
    value: { item: () => file, length: 1 },
  });
  fileInput.dispatchEvent(new Event('change'));
  await activeFixture.whenStable();
  activeFixture.detectChanges();
  return root;
}

function detectChanges(): void {
  activeFixture.detectChanges();
}

function setCutoff(root: HTMLElement): void {
  const cutoffInput = root.querySelector<HTMLInputElement>('input[type="date"]')!;
  cutoffInput.value = '2026-07-31';
  cutoffInput.dispatchEvent(new Event('input'));
  detectChanges();
}

function buildWorkbook(): WorkbookData {
  return workbook(shortRows());
}

function shortRows(): WorkbookCell[][] {
  return [1, 2, 3, 4, 5].map((month) =>
    absenceRow('000001', `01/0${month}/2026`, `01/0${month}/2026`, 'MAD'),
  );
}

function buildWorkbookWithLongDurations(): WorkbookData {
  return workbook([
    ...shortRows(),
    absenceRow('000010', '01/01/2025', '19/07/2025', 'MAD'),
    absenceRow('000011', '01/02/2025', '20/08/2025', 'BCN'),
    absenceRow('000012', '01/01/2025', '29/06/2025', 'BCN'),
  ]);
}

function absenceRow(
  employeeId: string,
  start: string,
  end: string,
  centre: string,
): WorkbookCell[] {
  return [
    employeeId,
    'Activo',
    'RG-14',
    start,
    end,
    'Enfermedad con Baja en la S.S',
    'RAM',
    '15/07/1970',
    'FD',
    'Fijo',
    'ADMINISTRATIVOS',
    'F',
    centre,
    null,
  ];
}

function workbook(rows: readonly (readonly WorkbookCell[])[]): WorkbookData {
  return { sheets: [{ name: 'Ausencias', rows: [EXPECTED_HEADERS, ...rows] }] };
}

function findButton(root: HTMLElement, label: string): HTMLButtonElement {
  const button = [...root.querySelectorAll<HTMLButtonElement>('button')].find((item) =>
    item.textContent?.includes(label),
  );
  if (!button) throw new Error(`BUTTON_NOT_FOUND: ${label}`);
  return button;
}
