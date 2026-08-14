import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { EXPECTED_HEADERS } from './application/import-profile';
import { WorkbookData } from './application/workbook';
import { ReadExcelFileWorkbookReader } from './infrastructure/read-excel-file-workbook-reader';
import { App } from './app';

describe('App', () => {
  it('crea la aplicación', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('explica el procesamiento local y ofrece el flujo R1', async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Tu archivo no sale del dispositivo');
    expect(text).toContain('Ejecutar análisis R1');
    expect(text).toContain('Eliminar sesión');
  });

  it('importa, analiza, explica y elimina una sesión con teclado', async () => {
    const workbook = buildWorkbook();
    const read = vi.fn().mockResolvedValue(workbook);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: ReadExcelFileWorkbookReader, useValue: { read } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const fileInput = root.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['synthetic'], 'synthetic.xlsx');
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: { item: () => file, length: 1 },
    });
    fileInput.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(read).toHaveBeenCalledOnce();
    expect(root.textContent).toContain('5 filas válidas');

    const cutoffInput = root.querySelector<HTMLInputElement>('input[type="date"]')!;
    cutoffInput.value = '2026-07-31';
    cutoffInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    findButton(root, 'Ejecutar análisis R1').click();
    fixture.detectChanges();
    expect(root.textContent).toContain('000001');
    expect(root.textContent).toContain('1 candidatos para revisión humana');

    findButton(root, 'Ver explicación').click();
    fixture.detectChanges();
    const dialog = root.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain('R1-v1');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(root.querySelector('[role="dialog"]')).toBeNull();

    findButton(root, 'Eliminar sesión').click();
    fixture.detectChanges();
    expect(root.textContent).toContain('Sesión eliminada');
    expect(root.textContent).not.toContain('000001');
  });
});

function buildWorkbook(): WorkbookData {
  const rows = [1, 2, 3, 4, 5].map((month) => [
    '000001',
    'Activo',
    'RG-14',
    `01/0${month}/2026`,
    `01/0${month}/2026`,
    'Enfermedad con Baja en la S.S',
    'RAM',
    '15/07/1970',
    'FD',
    'Fijo',
    'ADMINISTRATIVOS',
    'F',
    'MAD',
    null,
  ]);

  return { sheets: [{ name: 'Ausencias', rows: [EXPECTED_HEADERS, ...rows] }] };
}

function findButton(root: HTMLElement, label: string): HTMLButtonElement {
  const button = [...root.querySelectorAll<HTMLButtonElement>('button')].find((item) =>
    item.textContent?.includes(label),
  );
  if (!button) throw new Error(`BUTTON_NOT_FOUND: ${label}`);
  return button;
}
