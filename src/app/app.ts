import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SystemClock, lastCompleteMonthCutoff } from './application/clock';
import {
  ImportIssue,
  ValidatedAbsenceRecord,
  validateAbsenceWorkbook,
} from './application/import-profile';
import { normalizeAbsenceRecords } from './application/normalize';
import { EpisodeWarningCode } from './domain/absence';
import {
  LocalDate,
  compareLocalDates,
  formatIsoDate,
  formatSpanishDate,
  parseIsoDate,
} from './domain/local-date';
import {
  CandidateMatch,
  EpisodeExclusionReason,
  findShortDurationRecurrences,
  recurrenceWindowFor,
} from './domain/recurrence';
import { ReadExcelFileWorkbookReader } from './infrastructure/read-excel-file-workbook-reader';

type Phase = 'idle' | 'reading' | 'validating' | 'ready' | 'analyzing' | 'results' | 'error';

interface AnalysisWarning {
  readonly row: number;
  readonly code: EpisodeWarningCode;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('explanationDialog') private explanationDialog?: ElementRef<HTMLElement>;

  private readonly workbookReader = inject(ReadExcelFileWorkbookReader);
  private readonly clock = inject(SystemClock);
  private lastFocusedElement: HTMLElement | null = null;
  private records: readonly ValidatedAbsenceRecord[] = [];

  protected readonly phase = signal<Phase>('idle');
  protected readonly statusMessage = signal('Esperando un archivo sintético.');
  protected readonly importErrors = signal<readonly ImportIssue[]>([]);
  protected readonly sourceWarningCount = signal(0);
  protected readonly importedRowCount = signal(0);
  protected readonly candidates = signal<readonly CandidateMatch[]>([]);
  protected readonly analysisWarnings = signal<readonly AnalysisWarning[]>([]);
  protected readonly selectedCandidate = signal<CandidateMatch | null>(null);
  protected readonly cutoffIso = signal(formatIsoDate(lastCompleteMonthCutoff(this.clock.today())));
  protected readonly busy = computed(() =>
    ['reading', 'validating', 'analyzing'].includes(this.phase()),
  );
  protected readonly canAnalyze = computed(
    () => this.phase() === 'ready' || this.phase() === 'results',
  );

  protected async selectFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0);
    if (!file) return;

    this.resetResults();
    this.importErrors.set([]);

    if (!file.name.toLocaleLowerCase().endsWith('.xlsx')) {
      this.fail([{ severity: 'error', code: 'FILE_EXTENSION_INVALID', column: 'Estructura' }]);
      this.statusMessage.set('El archivo debe tener extensión .xlsx.');
      return;
    }

    this.phase.set('reading');
    this.statusMessage.set('Leyendo el libro localmente…');

    try {
      const workbook = await this.workbookReader.read(file);
      this.phase.set('validating');
      this.statusMessage.set('Validando estructura y filas…');
      const validation = validateAbsenceWorkbook(workbook);

      if (validation.errors.length > 0) {
        this.fail(validation.errors);
        return;
      }

      this.records = validation.records;
      this.sourceWarningCount.set(validation.warnings.length);
      this.importedRowCount.set(validation.records.length);
      this.phase.set('ready');
      this.statusMessage.set(
        `${validation.records.length} filas válidas. El archivo está listo para analizar.`,
      );
    } catch {
      this.fail([{ severity: 'error', code: 'WORKBOOK_READ_FAILED', column: 'Estructura' }]);
      this.statusMessage.set('No se pudo leer el libro. Revisa que sea un .xlsx compatible.');
    }
  }

  protected analyze(): void {
    const cutoff = parseIsoDate(this.cutoffIso());
    if (!cutoff) {
      this.statusMessage.set('Introduce una fecha de corte válida.');
      return;
    }

    this.phase.set('analyzing');
    this.statusMessage.set('Aplicando la regla R1…');

    const normalized = normalizeAbsenceRecords(this.records, cutoff);
    const window = recurrenceWindowFor(cutoff);
    this.analysisWarnings.set(
      normalized.episodes.flatMap((episode) => {
        const own = episode.warnings.map((code) => ({ row: episode.sourceRow, code }));
        const intersection =
          episode.effectiveEnd !== null &&
          compareLocalDates(episode.start, window.start) < 0 &&
          compareLocalDates(episode.effectiveEnd, window.start) >= 0
            ? [{ row: episode.sourceRow, code: 'INTERSECTS_WINDOW_FROM_BEFORE' as const }]
            : [];
        return [...own, ...intersection];
      }),
    );
    this.candidates.set(findShortDurationRecurrences(normalized.episodes, cutoff));
    this.phase.set('results');
    this.statusMessage.set(
      `Análisis completado: ${this.candidates().length} candidatos para revisión humana.`,
    );
  }

  protected openExplanation(candidate: CandidateMatch): void {
    this.lastFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.selectedCandidate.set(candidate);
    setTimeout(() => this.explanationDialog?.nativeElement.focus());
  }

  protected closeExplanation(): void {
    this.selectedCandidate.set(null);
    setTimeout(() => this.lastFocusedElement?.focus());
  }

  protected handleDialogKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeExplanation();
    }
  }

  protected clearSession(): void {
    this.records = [];
    this.phase.set('idle');
    this.statusMessage.set('Sesión eliminada. Esperando un archivo sintético.');
    this.importErrors.set([]);
    this.sourceWarningCount.set(0);
    this.importedRowCount.set(0);
    this.resetResults();
    this.cutoffIso.set(formatIsoDate(lastCompleteMonthCutoff(this.clock.today())));
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
      this.fileInput.nativeElement.focus();
    }
  }

  protected formatDate(value: LocalDate): string {
    return formatSpanishDate(value);
  }

  protected issueLabel(issue: ImportIssue): string {
    const labels: Record<ImportIssue['code'], string> = {
      FILE_EXTENSION_INVALID: 'El archivo debe tener extensión .xlsx.',
      WORKBOOK_READ_FAILED: 'El libro no se pudo leer de forma segura.',
      WORKBOOK_SHEET_COUNT: 'El libro debe contener exactamente una hoja compatible.',
      HEADER_MISSING: 'Falta una cabecera obligatoria.',
      HEADER_ADDITIONAL: 'Se ha encontrado una cabecera no admitida.',
      HEADER_DUPLICATED: 'Hay una cabecera duplicada.',
      HEADER_ORDER_INCOMPATIBLE: 'El orden de las cabeceras no coincide con el perfil.',
      REQUIRED_VALUE_MISSING: 'Falta un valor obligatorio.',
      EMPLOYEE_ID_NOT_TEXT: 'El identificador de nómina debe estar almacenado como texto.',
      DATE_INVALID: 'La fecha no es válida.',
      END_BEFORE_START: 'La fecha final es anterior a la inicial.',
      ABSENCE_DESCRIPTION_UNKNOWN: 'La descripción de ausencia no pertenece al inventario.',
      SOURCE_DURATION_DISCARDED: 'La duración de origen se ha descartado.',
    };
    return labels[issue.code];
  }

  protected warningLabel(code: EpisodeWarningCode): string {
    const labels: Record<EpisodeWarningCode, string> = {
      START_AFTER_CUTOFF: 'Inicio posterior al corte: episodio excluido.',
      END_AFTER_CUTOFF: 'Final posterior al corte: episodio recortado.',
      OPEN_END: 'Final abierto: se utiliza la fecha de corte.',
      INTERSECTS_WINDOW_FROM_BEFORE:
        'Interseca la ventana, pero comenzó antes y no incrementa el contador.',
    };
    return labels[code];
  }

  protected reasonLabel(reason: EpisodeExclusionReason): string {
    const labels: Record<EpisodeExclusionReason, string> = {
      COUNTED: 'Contabilizado',
      LONGER_THAN_30_DAYS: 'Excluido: duración superior a 30 días',
      STARTED_BEFORE_WINDOW: 'Excluido: comenzó antes de la ventana',
      STARTED_AFTER_CUTOFF: 'Excluido: comenzó después del corte',
    };
    return labels[reason];
  }

  private fail(errors: readonly ImportIssue[]): void {
    this.records = [];
    this.importErrors.set(errors);
    this.importedRowCount.set(0);
    this.sourceWarningCount.set(0);
    this.phase.set('error');
    this.statusMessage.set(
      `La validación encontró ${errors.length} errores bloqueantes. No se ha ejecutado el análisis.`,
    );
  }

  private resetResults(): void {
    this.candidates.set([]);
    this.analysisWarnings.set([]);
    this.selectedCandidate.set(null);
  }
}
