import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideAppTranslations } from './app.config';
import { EXPECTED_HEADERS } from './application/import-profile';
import { CandidateReport } from './application/report';
import { WorkbookCell, WorkbookData } from './application/workbook';
import { BrowserDownload } from './infrastructure/browser-download';
import { ReadExcelFileWorkbookReader } from './infrastructure/read-excel-file-workbook-reader';
import { WriteExcelFileReportExporter } from './infrastructure/write-excel-file-report-exporter';
import { App } from './app';
import { addDays, formatSpanishDate, parseIsoDate } from './domain/local-date';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });
  it('crea la aplicación', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('explica el procesamiento local y ofrece los dos análisis con nombres comprensibles', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Tu archivo no sale del dispositivo');
    expect(text).toContain('Carga y valida un archivo para configurar el análisis');
    expect(text).toContain('Seleccionar archivo de ejemplo');
    expect(text).toContain('Recurrencia corta');
    expect(text).toContain('Larga duración');
    expect(text).not.toMatch(/R1-v1|R2-v1/);
  });

  it('importa, analiza, abre la ficha R1 y elimina la sesión', async () => {
    const root = await importWorkbook(buildWorkbook());

    expect(root.textContent).toContain('synthetic.xlsx');
    expect(root.textContent).toContain('Filas válidas');
    expect(root.textContent).toContain('5');
    setCutoff(root);
    findButton(root, 'Ejecutar análisis').click();
    detectChanges();

    expect(root.textContent).toContain('000001');
    expect(root.textContent).toContain('Recurrencia corta');

    findButton(root, 'Ver ficha').click();
    detectChanges();
    await activeFixture.whenStable();
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain('Recurrencia corta');
    findButton(dialog, 'Cerrar').click();
    await activeFixture.whenStable();
    await waitForDialogClose();
    detectChanges();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    findButton(root, 'Borrar datos y empezar de nuevo').click();
    await activeFixture.whenStable();
    const clearDialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(clearDialog.textContent).toContain(
      'El archivo original y las descargas no se eliminarán',
    );
    findButton(clearDialog, 'Borrar datos').click();
    await activeFixture.whenStable();
    await waitForDialogClose();
    detectChanges();
    expect(root.textContent).toContain('Seleccionar archivo de ejemplo');
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
      (input) => input.closest('mat-checkbox')?.textContent?.includes('BCN'),
    )!;
    bcnFilter.click();
    detectChanges();

    expect(root.textContent).not.toContain('000010');
    expect(root.textContent).toContain('000011');
    expect(root.textContent).toContain('000012');

    findButton(root, 'Ver ficha').click();
    detectChanges();
    await activeFixture.whenStable();
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain('Larga duración');
    expect(dialog.textContent).toContain('Episodio representativo');
    findButton(dialog, 'Cerrar').click();
    await activeFixture.whenStable();
    await waitForDialogClose();
    detectChanges();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    expect(readWorkbook).toHaveBeenCalledOnce();
  });

  it('mantiene local el filtro de revisión y exporta el listado R2 completo', async () => {
    const root = await importWorkbook(buildWorkbookWithLongDurations());
    setCutoff(root);
    findButton(root, 'Ejecutar análisis').click();
    detectChanges();
    findButton(root, 'Larga duración').click();
    detectChanges();
    findButton(root, 'Revisión').click();
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
    expect(root.textContent).toContain('2empleados candidatos');

    findButton(root, 'Larga duración').click();
    detectChanges();
    expect(root.textContent).toContain('000010');
    root.querySelector<HTMLButtonElement>('[data-testid="export-report-r2"]')!.click();
    await activeFixture.whenStable();
    detectChanges();

    expect(createReport).toHaveBeenCalledOnce();
    const report = createReport.mock.calls[0][0] as CandidateReport;
    expect(report.sheets.map((sheet) => sheet.name)).toEqual(['Resumen', 'Candidatos']);
    expect(report.sheets[1].rows).toHaveLength(4);
    expect(saveDownload).toHaveBeenCalledWith(expect.any(Blob), report.fileName);
  });

  it('abre y exporta una ficha individual sin convertir vacaciones en ausencia médica', async () => {
    const root = await importWorkbook(buildWorkbookWithVacation());
    setCutoff(root);
    findButton(root, 'Ejecutar análisis').click();
    detectChanges();

    findButton(root, 'Ver ficha').click();
    detectChanges();
    await activeFixture.whenStable();
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain('Ficha explicable');
    expect(dialog.textContent).toContain('Episodios contabilizados');
    expect(dialog.textContent).not.toContain('Vacaciones');

    findButton(dialog, 'Exportar Excel').click();
    await activeFixture.whenStable();
    await waitForDialogClose();
    detectChanges();

    const report = createReport.mock.calls[0][0] as CandidateReport;
    expect(report.sheets.map((sheet) => sheet.name)).toEqual(['Ficha']);
    expect(report.sheets[0].rows.flat()).not.toContain('Vacaciones');
  });

  it('muestra la ubicación después de episodios tomando solo el inicio contabilizado más reciente', async () => {
    const root = await analyzeWorkbook(
      workbook([
        ...shortRows(),
        absenceRow('000001', '01/06/2026', '01/06/2026', 'BCN'),
        absenceRow('000001', '01/06/2026', '01/06/2026', 'BIO'),
        absenceRow('000001', '01/07/2026', '31/07/2026', 'AGP'),
        absenceRow('000001', '01/08/2026', '01/08/2026', 'ALC'),
      ]),
    );
    const table = resultTable(root, 'r1');
    const headers = [...table.querySelectorAll('th')].map((th) => th.textContent?.trim());
    expect(headers.slice(0, 5)).toEqual([
      'Posición',
      'Nº Nómina',
      'Episodios',
      'Ubicación - Código',
      'Inicio más reciente',
    ]);
    expect(table.querySelectorAll('tbody tr td')[3].textContent?.trim()).toBe('BCN');
    expect(table.querySelector('th:first-child')?.hasAttribute('mat-sort-header')).toBe(false);
    expect(table.querySelector('th:last-child')?.hasAttribute('mat-sort-header')).toBe(false);
  });

  it('ordena todos los candidatos antes del límite de diez, admite teclado y conserva la exportación', async () => {
    const root = await analyzeWorkbook(buildManyCandidates());
    const table = resultTable(root, 'r1');
    expect(tableIds(table)).toHaveLength(10);
    expect(tableIds(table)).not.toContain('000001');
    const defaultOrder = tableIds(table);

    const header = sortHeader(table, 'employeeId');
    const control = header.querySelector<HTMLElement>('[role="button"]')!;
    expect(control.tabIndex).toBe(0);
    expect(control.getAttribute('aria-describedby')).toBeTruthy();
    control.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }),
    );
    detectChanges();
    expect(header.getAttribute('aria-sort')).toBe('ascending');
    expect(tableIds(table)[0]).toBe('000001');
    expect(table.querySelector('tbody tr td')?.textContent?.trim()).toBe('1');
    expect(root.querySelector('.table-order')?.textContent).toContain('Nº Nómina, ascendente');

    findButton(root, 'Ver todos').click();
    detectChanges();
    expect(tableIds(table)).toHaveLength(12);
    expect(tableIds(table)[0]).toBe('000001');
    findButton(root, 'Ver primeros 10').click();
    detectChanges();
    expect(tableIds(table)).toHaveLength(10);

    root.querySelector<HTMLButtonElement>('[data-testid="export-report"]')!.click();
    await activeFixture.whenStable();
    const report = createReport.mock.calls[0][0] as CandidateReport;
    expect(report.sheets[1].rows).toHaveLength(13);
    expect(report.sheets[1].rows[1][0]).toBe('000012');
    expect(report.sheets[1].rows[0]).not.toContain('Ubicación - Código');

    clickSort(table, 'employeeId');
    expect(header.getAttribute('aria-sort')).toBe('descending');
    expect(tableIds(table)[0]).toBe('000012');
    clickSort(table, 'employeeId');
    expect(header.getAttribute('aria-sort')).toBe('none');
    expect(tableIds(table)).toEqual(defaultOrder);
  });

  it('mantiene órdenes independientes en las tres pestañas y filtra R2 antes de ordenar', async () => {
    const root = await analyzeWorkbook(buildManyCandidates());
    clickSort(resultTable(root, 'r1'), 'employeeId');
    findButton(root, 'Larga duración').click();
    detectChanges();
    let table = resultTable(root, 'r2');
    expect(tableIds(table)).not.toContain('000001');
    clickSort(table, 'maximumDuration');
    expect(tableIds(table)[0]).toBe('000001');

    const filter = [...root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')].find(
      (input) => input.closest('mat-checkbox')?.textContent?.includes('BCN'),
    )!;
    filter.click();
    detectChanges();
    expect(tableIds(table)).toEqual(['000002', '000004', '000006', '000008', '000010', '000012']);

    root.querySelector<HTMLButtonElement>('[data-testid="export-report-r2"]')!.click();
    await activeFixture.whenStable();
    const report = createReport.mock.calls[0][0] as CandidateReport;
    expect(report.sheets[1].rows).toHaveLength(7);
    expect(report.sheets[1].rows[1][0]).toBe('000012');

    findButton(root, 'Revisión').click();
    detectChanges();
    table = root.querySelector<HTMLTableElement>('table[mat-table]')!;
    const defaultReview = tableIds(table);
    expect(defaultReview[0]).toBe('000001');
    clickSort(table, 'episodeCount');
    clickSort(table, 'episodeCount');
    expect(tableIds(table)[0]).toBe('000012');
    clickSort(table, 'episodeCount');
    expect(tableIds(table)).toEqual(defaultReview);
    expect(sortHeader(table, 'employeeId').getAttribute('aria-sort')).toBe('ascending');

    findButton(root, 'Recurrencia corta').click();
    detectChanges();
    table = resultTable(root, 'r1');
    expect(tableIds(table)[0]).toBe('000001');
    expect(sortHeader(table, 'employeeId').getAttribute('aria-sort')).toBe('ascending');
    findButton(root, 'Larga duración').click();
    detectChanges();
    table = resultTable(root, 'r2');
    expect(tableIds(table)[0]).toBe('000002');
    expect(sortHeader(table, 'maximumDuration').getAttribute('aria-sort')).toBe('ascending');
    clickSort(table, 'maximumDuration');
    clickSort(table, 'maximumDuration');
    expect(tableIds(table)[0]).toBe('000012');
  });

  it('restaura las ordenaciones y el límite de diez al analizar de nuevo, importar y borrar', async () => {
    const root = await analyzeWorkbook(buildManyCandidates());
    clickSort(resultTable(root, 'r1'), 'employeeId');
    findButton(root, 'Ver todos').click();
    detectChanges();
    findButton(root, 'Larga duración').click();
    detectChanges();
    clickSort(resultTable(root, 'r2'), 'employeeId');
    findButton(root, 'Revisión').click();
    detectChanges();
    clickSort(root.querySelector<HTMLTableElement>('table[mat-table]')!, 'episodeCount');
    clickSort(root.querySelector<HTMLTableElement>('table[mat-table]')!, 'episodeCount');
    findButton(root, 'Modificar análisis').click();
    detectChanges();
    findButton(root, 'Ejecutar análisis').click();
    detectChanges();
    expect(tableIds(root.querySelector<HTMLTableElement>('table[mat-table]')!)[0]).toBe('000001');
    findButton(root, 'Larga duración').click();
    detectChanges();
    expect(tableIds(resultTable(root, 'r2'))[0]).toBe('000012');
    findButton(root, 'Recurrencia corta').click();
    detectChanges();
    expect(tableIds(resultTable(root, 'r1'))).toHaveLength(10);
    expect(tableIds(resultTable(root, 'r1'))[0]).toBe('000012');

    clickSort(resultTable(root, 'r1'), 'employeeId');
    findButton(root, 'Cambiar archivo').click();
    detectChanges();
    selectSyntheticFile(root);
    await activeFixture.whenStable();
    setCutoff(root);
    findButton(root, 'Ejecutar análisis').click();
    detectChanges();
    expect(tableIds(resultTable(root, 'r1'))[0]).toBe('000012');

    clickSort(resultTable(root, 'r1'), 'employeeId');
    findButton(root, 'Borrar datos y empezar de nuevo').click();
    await activeFixture.whenStable();
    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!;
    findButton(dialog, 'Borrar datos').click();
    await activeFixture.whenStable();
    await waitForDialogClose();
    detectChanges();
    selectSyntheticFile(root);
    await activeFixture.whenStable();
    setCutoff(root);
    findButton(root, 'Ejecutar análisis').click();
    detectChanges();
    expect(tableIds(resultTable(root, 'r1'))[0]).toBe('000012');
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
  selectSyntheticFile(root);
  await activeFixture.whenStable();
  activeFixture.detectChanges();
  return root;
}

function selectSyntheticFile(root: HTMLElement): void {
  const fileInput = root.querySelector<HTMLInputElement>('input[type="file"]')!;
  const file = new File(['synthetic'], 'synthetic.xlsx');
  Object.defineProperty(fileInput, 'files', {
    configurable: true,
    value: { item: () => file, length: 1 },
  });
  fileInput.dispatchEvent(new Event('change'));
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
function buildWorkbookWithVacation(): WorkbookData {
  return workbook([
    ...shortRows(),
    absenceRow('000001', '15/06/2026', '30/06/2026', 'MAD', 'Vacaciones'),
  ]);
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

function buildManyCandidates(): WorkbookData {
  return workbook(
    Array.from({ length: 12 }, (_, index) => {
      const employeeId = String(index + 1).padStart(6, '0');
      const centre = index % 2 === 0 ? 'MAD' : 'BCN';
      return [
        ...Array.from({ length: index + 5 }, (_, day) => {
          const date = `${String(day + 1).padStart(2, '0')}/07/2026`;
          return absenceRow(employeeId, date, date, centre);
        }),
        absenceRow(
          employeeId,
          '01/01/2025',
          formatSpanishDate(addDays(parseIsoDate('2025-01-01')!, 179 + index)),
          centre,
        ),
      ];
    }).flat(),
  );
}

async function analyzeWorkbook(data: WorkbookData): Promise<HTMLElement> {
  const root = await importWorkbook(data);
  setCutoff(root);
  findButton(root, 'Ejecutar análisis').click();
  detectChanges();
  return root;
}

function resultTable(root: HTMLElement, view: 'r1' | 'r2'): HTMLTableElement {
  return root.querySelector<HTMLTableElement>(`#panel-${view} table`)!;
}

function tableIds(table: HTMLTableElement): string[] {
  return [...table.querySelectorAll('tbody .employee-id')].map((cell) => cell.textContent!.trim());
}

function sortHeader(table: HTMLTableElement, column: string): HTMLElement {
  return (
    table.querySelector<HTMLElement>(`th[data-sort-column="${column}"]`) ??
    table.querySelector<HTMLElement>(`th.mat-column-${column}`)!
  );
}

function clickSort(table: HTMLTableElement, column: string): void {
  sortHeader(table, column).click();
  detectChanges();
}

function absenceRow(
  employeeId: string,
  start: string,
  end: string,
  centre: string,
  description = 'Enfermedad con Baja en la S.S',
): WorkbookCell[] {
  return [
    employeeId,
    'Activo',
    'RG-14',
    start,
    end,
    description,
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

async function waitForDialogClose(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));
}

function findButton(root: HTMLElement, label: string): HTMLButtonElement {
  const button = [...root.querySelectorAll<HTMLButtonElement>('button')].find((item) =>
    item.textContent?.includes(label),
  );
  if (!button) throw new Error(`BUTTON_NOT_FOUND: ${label}`);
  return button;
}
