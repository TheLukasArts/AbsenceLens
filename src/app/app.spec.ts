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
