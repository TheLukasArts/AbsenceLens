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
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AnalysisAdjustment,
  summarizeAnalysisAdjustments,
} from './application/analysis-adjustments';
import {
  CandidateReviewSortColumn,
  CandidateReviewSortDirection,
  CandidateReviewSummary,
  buildCandidateReviewSummaries,
  sortCandidateReviewSummaries,
} from './application/candidate-review';
import { SystemClock, lastCompleteMonthCutoff } from './application/clock';
import {
  EXPECTED_HEADERS,
  ImportIssue,
  ValidatedAbsenceRecord,
  validateAbsenceWorkbook,
} from './application/import-profile';
import { normalizeAbsenceRecords } from './application/normalize';
import {
  CandidateEpisodeReportRow,
  CandidateTable,
  buildCandidateDetailReport,
  buildCandidateListReport,
} from './application/report';
import {
  REVIEW_COLUMNS,
  ReviewColumn,
  ReviewColumnFilter,
  ReviewRow,
  SortDirection,
  buildReviewRows,
  queryReviewRows,
  reviewColumnLabel,
  reviewValue,
  rowsForEmployees,
} from './application/review';
import { AbsenceEpisode, EpisodeWarningCode } from './domain/absence';
import { LocalDate, formatIsoDate, formatSpanishDate, parseIsoDate } from './domain/local-date';
import {
  LongDurationCandidate,
  buildLongDurationCandidates,
  filterLongDurationCandidates,
} from './domain/long-duration';
import {
  CandidateMatch,
  EpisodeExclusionReason,
  findShortDurationRecurrences,
  recurrenceWindowFor,
} from './domain/recurrence';
import { ReadExcelFileWorkbookReader } from './infrastructure/read-excel-file-workbook-reader';
import { BrowserDownload } from './infrastructure/browser-download';
import { WriteExcelFileReportExporter } from './infrastructure/write-excel-file-report-exporter';
import {
  CandidateDetailDialogComponent,
  CandidateDetailDialogData,
  CandidateDetailSection,
} from './presentation/candidate-detail-dialog.component';

type Phase = 'idle' | 'reading' | 'validating' | 'ready' | 'analyzing' | 'results' | 'error';
type ResultView = 'r1' | 'r2';
type ResultSection = ResultView | 'review';

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('explanationDialog') private explanationDialog?: ElementRef<HTMLElement>;

  private readonly workbookReader = inject(ReadExcelFileWorkbookReader);
  private readonly reportExporter = inject(WriteExcelFileReportExporter);
  private readonly browserDownload = inject(BrowserDownload);
  private readonly clock = inject(SystemClock);
  private readonly dialog = inject(MatDialog);
  private lastFocusedElement: HTMLElement | null = null;
  private records: readonly ValidatedAbsenceRecord[] = [];

  protected readonly phase = signal<Phase>('idle');
  protected readonly statusMessage = signal('Esperando un archivo sintético.');
  protected readonly importErrors = signal<readonly ImportIssue[]>([]);
  protected readonly importedRowCount = signal(0);
  protected readonly candidates = signal<readonly CandidateMatch[]>([]);
  protected readonly longCandidates = signal<readonly LongDurationCandidate[]>([]);
  protected readonly reviewRows = signal<readonly ReviewRow[]>([]);
  protected readonly reviewFilters = signal<readonly ReviewColumnFilter[]>([]);
  protected readonly reviewFilterColumn = signal<ReviewColumn>('employeeId');
  protected readonly reviewFilterValue = signal('');
  protected readonly reviewStartFromIso = signal('');
  protected readonly reviewStartToIso = signal('');
  protected readonly reviewSortColumn = signal<ReviewColumn>('start');
  protected readonly reviewSortDirection = signal<SortDirection>('asc');
  protected readonly analysisWarnings = signal<readonly AnalysisAdjustment[]>([]);
  protected readonly selectedCandidate = signal<CandidateMatch | null>(null);
  protected readonly selectedLongCandidate = signal<LongDurationCandidate | null>(null);
  protected readonly selectedCentres = signal<readonly string[]>([]);
  protected readonly resultView = signal<ResultView>('r1');
  protected readonly resultSection = signal<ResultSection>('r1');
  protected readonly selectedReviewEmployeeId = signal<string | null>(null);
  protected readonly showAllR1 = signal(false);
  protected readonly showAllR2 = signal(false);
  protected readonly candidateSortColumn = signal<CandidateReviewSortColumn>('employeeId');
  protected readonly candidateSortDirection = signal<CandidateReviewSortDirection>('asc');
  protected readonly cutoffIso = signal(formatIsoDate(lastCompleteMonthCutoff(this.clock.today())));
  protected readonly busy = computed(
    () => ['reading', 'validating', 'analyzing'].includes(this.phase()) || this.exportBusy(),
  );
  protected readonly exportBusy = signal(false);
  protected readonly exportError = signal('');
  protected readonly reviewColumns = REVIEW_COLUMNS;
  protected readonly expectedHeaders = EXPECTED_HEADERS;
  protected readonly canAnalyze = computed(
    () => this.phase() === 'ready' || this.phase() === 'results',
  );
  protected readonly availableCentres = computed(() =>
    [...new Set(this.longCandidates().map((item) => item.representativeEpisode.workCentre))].sort(),
  );
  protected readonly longTop = computed(() =>
    filterLongDurationCandidates(this.longCandidates(), new Set(this.selectedCentres())),
  );
  private readonly reviewEmployeeIds = computed(
    () =>
      new Set(
        (this.resultView() === 'r1' ? this.candidates() : this.longTop()).map(
          (candidate) => candidate.employeeId,
        ),
      ),
  );
  protected readonly reviewRowsForView = computed(() =>
    rowsForEmployees(this.reviewRows(), this.reviewEmployeeIds()),
  );
  protected readonly filteredReviewRows = computed(() =>
    queryReviewRows(this.reviewRowsForView(), {
      filters: this.reviewFilters(),
      startFrom: parseIsoDate(this.reviewStartFromIso()),
      startTo: parseIsoDate(this.reviewStartToIso()),
      sortColumn: this.reviewSortColumn(),
      sortDirection: this.reviewSortDirection(),
    }),
  );
  private readonly filteredEmployeeIds = computed(
    () => new Set(this.filteredReviewRows().map((row) => row.employeeId)),
  );
  protected readonly visibleCandidates = computed(() =>
    this.candidates().filter((candidate) => this.filteredEmployeeIds().has(candidate.employeeId)),
  );
  protected readonly visibleLongCandidates = computed(() =>
    this.longTop().filter((candidate) => this.filteredEmployeeIds().has(candidate.employeeId)),
  );
  protected readonly reviewCandidateIds = computed(() =>
    (this.resultView() === 'r1' ? this.visibleCandidates() : this.visibleLongCandidates()).map(
      (candidate) => candidate.employeeId,
    ),
  );
  protected readonly activeReviewEmployeeId = computed(() => {
    const ids = this.reviewCandidateIds();
    const selected = this.selectedReviewEmployeeId();
    return selected && ids.includes(selected) ? selected : (ids[0] ?? null);
  });
  protected readonly activeReviewRows = computed(() => {
    const employeeId = this.activeReviewEmployeeId();
    if (!employeeId) return [];
    const sourceRows =
      this.resultView() === 'r1'
        ? new Set(
            this.candidates()
              .find((candidate) => candidate.employeeId === employeeId)
              ?.explanation.episodes.map((item) => item.episode.sourceRow) ?? [],
          )
        : new Set(
            this.longCandidates()
              .find((candidate) => candidate.employeeId === employeeId)
              ?.explanation.episodes.map((item) => item.episode.sourceRow) ?? [],
          );
    return this.reviewRows().filter((row) => sourceRows.has(row.sourceRow));
  });
  protected readonly activeR1ReviewCandidate = computed(() =>
    this.resultView() === 'r1'
      ? this.candidates().find(
          (candidate) => candidate.employeeId === this.activeReviewEmployeeId(),
        )
      : undefined,
  );
  protected readonly activeR2ReviewCandidate = computed(() =>
    this.resultView() === 'r2'
      ? this.longCandidates().find(
          (candidate) => candidate.employeeId === this.activeReviewEmployeeId(),
        )
      : undefined,
  );
  protected readonly hasReviewFilters = computed(
    () =>
      this.reviewFilters().length > 0 ||
      this.reviewStartFromIso().length > 0 ||
      this.reviewStartToIso().length > 0,
  );
  protected readonly resultCount = computed(() =>
    this.resultView() === 'r1'
      ? this.visibleCandidates().length
      : this.visibleLongCandidates().length,
  );
  protected readonly displayedCandidates = computed(() =>
    this.showAllR1() ? this.candidates() : this.candidates().slice(0, 10),
  );
  protected readonly displayedLongCandidates = computed(() =>
    this.showAllR2() ? this.longTop() : this.longTop().slice(0, 10),
  );
  private readonly candidateReviewSummaries = computed(() =>
    buildCandidateReviewSummaries(this.candidates(), this.longCandidates()),
  );
  private readonly candidateEmployeeIds = computed(
    () => new Set(this.candidateReviewSummaries().map((row) => row.employeeId)),
  );
  private readonly candidateReviewRows = computed(() =>
    rowsForEmployees(this.reviewRows(), this.candidateEmployeeIds()),
  );
  private readonly candidateFilterRows = computed(() =>
    queryReviewRows(this.candidateReviewRows(), {
      filters: this.reviewFilters(),
      startFrom: parseIsoDate(this.reviewStartFromIso()),
      startTo: parseIsoDate(this.reviewStartToIso()),
      sortColumn: 'start',
      sortDirection: 'asc',
    }),
  );
  private readonly candidateFilteredEmployeeIds = computed(
    () => new Set(this.candidateFilterRows().map((row) => row.employeeId)),
  );
  protected readonly filteredCandidateReview = computed(() => {
    const rows = this.candidateReviewSummaries().filter((row) =>
      this.candidateFilteredEmployeeIds().has(row.employeeId),
    );
    return sortCandidateReviewSummaries(
      rows,
      this.candidateSortColumn(),
      this.candidateSortDirection(),
    );
  });
  protected readonly reviewDisplayedColumns = [
    'employeeId',
    'rules',
    'episodeCount',
    'mostRecentStart',
    'maximumDuration',
    'workCentre',
    'actions',
  ];

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
    this.statusMessage.set('Aplicando las reglas R1 y R2…');

    const normalized = normalizeAbsenceRecords(this.records, cutoff);
    const window = recurrenceWindowFor(cutoff);
    this.analysisWarnings.set(summarizeAnalysisAdjustments(normalized.episodes, window));

    const recurrenceCandidates = findShortDurationRecurrences(normalized.episodes, cutoff);
    const longDurationCandidates = buildLongDurationCandidates(normalized.episodes, cutoff);
    this.candidates.set(recurrenceCandidates);
    this.longCandidates.set(longDurationCandidates);
    this.reviewRows.set(buildReviewRows(this.records, normalized.episodes));
    this.selectedCentres.set([]);
    this.showAllR1.set(false);
    this.showAllR2.set(false);
    this.phase.set('results');
    this.statusMessage.set(
      `Análisis completado: ${recurrenceCandidates.length} coincidencias R1 y ${longDurationCandidates.length} candidaturas R2 para revisión humana.`,
    );
  }

  protected selectResultView(view: ResultView): void {
    this.resultView.set(view);
    this.resultSection.set(view);
    this.selectedReviewEmployeeId.set(null);
  }

  protected openCandidateReview(employeeId: string, view: ResultView): void {
    this.resultView.set(view);
    this.resultSection.set('review');
    this.selectedReviewEmployeeId.set(employeeId);
  }

  protected openReviewSection(): void {
    this.resultSection.set('review');
    this.selectedReviewEmployeeId.set(this.activeReviewEmployeeId());
  }

  protected selectReviewEmployee(employeeId: string): void {
    this.selectedReviewEmployeeId.set(employeeId);
  }

  protected toggleCentre(centre: string, checked: boolean): void {
    this.selectedCentres.update((selected) =>
      checked
        ? [...new Set([...selected, centre])].sort()
        : selected.filter((item) => item !== centre),
    );
  }

  protected clearCentreFilter(): void {
    this.selectedCentres.set([]);
  }

  protected isCentreSelected(centre: string): boolean {
    return this.selectedCentres().includes(centre);
  }

  protected setReviewFilterColumn(value: string): void {
    if (REVIEW_COLUMNS.some((column) => column.key === value)) {
      this.reviewFilterColumn.set(value as ReviewColumn);
    }
  }

  protected addReviewFilter(): void {
    const value = this.reviewFilterValue().trim();
    if (!value) return;

    const column = this.reviewFilterColumn();
    this.reviewFilters.update((filters) => [
      ...filters.filter((filter) => filter.column !== column),
      { column, value },
    ]);
    this.reviewFilterValue.set('');
  }

  protected removeReviewFilter(column: ReviewColumn): void {
    this.reviewFilters.update((filters) => filters.filter((filter) => filter.column !== column));
  }

  protected clearReviewFilters(): void {
    this.reviewFilters.set([]);
    this.reviewFilterValue.set('');
    this.reviewStartFromIso.set('');
    this.reviewStartToIso.set('');
  }

  protected setReviewSortColumn(value: string): void {
    if (REVIEW_COLUMNS.some((column) => column.key === value)) {
      this.reviewSortColumn.set(value as ReviewColumn);
    }
  }

  protected setReviewSortDirection(value: string): void {
    if (value === 'asc' || value === 'desc') {
      this.reviewSortDirection.set(value);
    }
  }

  protected reviewCell(row: ReviewRow, column: ReviewColumn): string {
    return reviewValue(row, column);
  }

  protected reviewFilterLabel(filter: ReviewColumnFilter): string {
    return `${reviewColumnLabel(filter.column)}: ${filter.value}`;
  }

  protected changeCandidateSort(sort: Sort): void {
    const columns: CandidateReviewSortColumn[] = [
      'employeeId',
      'rules',
      'episodeCount',
      'mostRecentStart',
      'maximumDuration',
      'workCentre',
    ];
    if (!columns.includes(sort.active as CandidateReviewSortColumn)) return;
    this.candidateSortColumn.set(sort.active as CandidateReviewSortColumn);
    this.candidateSortDirection.set(sort.direction === 'desc' ? 'desc' : 'asc');
  }

  protected async exportCurrentView(): Promise<void> {
    const cutoff = parseIsoDate(this.cutoffIso());
    const count = this.resultView() === 'r1' ? this.candidates().length : this.longTop().length;
    if (!cutoff || count === 0) return;

    this.exportBusy.set(true);
    this.exportError.set('');
    try {
      const report = buildCandidateListReport({
        view: this.resultView(),
        cutoff,
        filters: [],
        startFrom: null,
        startTo: null,
        candidateTable: this.currentCandidateTable(),
        warningCount: this.analysisWarnings().length,
      });
      const blob = await this.reportExporter.create(report);
      this.browserDownload.save(blob, report.fileName);
      this.statusMessage.set(
        `Listado exportado: ${count} candidatos en ${report.sheets.length} hojas.`,
      );
    } catch {
      this.exportError.set('No se pudo generar el Excel. Los datos permanecen en esta sesión.');
    } finally {
      this.exportBusy.set(false);
    }
  }

  protected async exportCandidate(employeeId: string, view: ResultView): Promise<void> {
    const cutoff = parseIsoDate(this.cutoffIso());
    if (!cutoff) return;
    const reportInput = this.candidateDetailInput(employeeId, view);
    if (!reportInput) return;

    this.exportBusy.set(true);
    this.exportError.set('');
    try {
      const report = buildCandidateDetailReport({ view, cutoff, employeeId, ...reportInput });
      const blob = await this.reportExporter.create(report);
      this.browserDownload.save(blob, report.fileName);
      this.statusMessage.set('Ficha individual preparada con los episodios médicos pertinentes.');
    } catch {
      this.exportError.set('No se pudo generar la ficha. Los datos permanecen en esta sesión.');
    } finally {
      this.exportBusy.set(false);
    }
  }

  protected openCandidateDetail(employeeId: string, view?: ResultView): void {
    const sections = (view ? [view] : (['r1', 'r2'] as const))
      .map((item) => this.candidateDialogSection(employeeId, item))
      .filter((item): item is CandidateDetailSection => item !== null);
    if (sections.length === 0) return;

    const cutoff = parseIsoDate(this.cutoffIso());
    if (!cutoff) return;
    const data: CandidateDetailDialogData = {
      employeeId,
      cutoff: formatSpanishDate(cutoff),
      sections,
    };
    this.dialog
      .open(CandidateDetailDialogComponent, {
        data,
        autoFocus: 'dialog',
        restoreFocus: true,
        maxWidth: '96vw',
      })
      .afterClosed()
      .subscribe((result?: { exportView?: ResultView }) => {
        if (result?.exportView) void this.exportCandidate(employeeId, result.exportView);
      });
  }

  protected openExplanation(candidate: CandidateMatch): void {
    this.captureFocus();
    this.selectedLongCandidate.set(null);
    this.selectedCandidate.set(candidate);
    this.focusDialog();
  }

  protected openLongExplanation(candidate: LongDurationCandidate): void {
    this.captureFocus();
    this.selectedCandidate.set(null);
    this.selectedLongCandidate.set(candidate);
    this.focusDialog();
  }

  protected closeExplanation(): void {
    this.selectedCandidate.set(null);
    this.selectedLongCandidate.set(null);
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
    this.importedRowCount.set(0);
    this.resetResults();
    this.cutoffIso.set(formatIsoDate(lastCompleteMonthCutoff(this.clock.today())));
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
      this.fileInput.nativeElement.focus();
    }
  }

  protected formatDate(value: LocalDate | undefined): string {
    return value ? formatSpanishDate(value) : '—';
  }

  protected longEpisodeStatus(episode: AbsenceEpisode): string {
    if (episode.warnings.includes('OPEN_END')) {
      return 'Activo';
    }
    if (episode.warnings.includes('END_AFTER_CUTOFF')) {
      return 'Recortado al corte';
    }
    return 'Finalizado';
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
    };
    return labels[issue.code];
  }

  protected warningLabel(adjustment: AnalysisAdjustment): string {
    const labels: Record<AnalysisAdjustment['code'], string> = {
      START_AFTER_CUTOFF: 'episodios médicos comienzan después de la fecha de corte y se excluyen',
      END_AFTER_CUTOFF:
        'episodios médicos terminan después del corte y se calculan hasta esa fecha',
      OPEN_END: 'episodios médicos no tienen fecha final y se calculan hasta la fecha de corte',
      INTERSECTS_WINDOW_FROM_BEFORE:
        'episodios médicos ya estaban en curso al comenzar la ventana y no aumentan la recurrencia',
    };
    return `${adjustment.count} ${labels[adjustment.code]}.`;
  }

  protected episodeWarningLabel(code: EpisodeWarningCode): string {
    const labels: Record<EpisodeWarningCode, string> = {
      START_AFTER_CUTOFF: 'Inicio posterior al corte.',
      END_AFTER_CUTOFF: 'Final calculado hasta el corte.',
      OPEN_END: 'Final abierto calculado hasta el corte.',
      INTERSECTS_WINDOW_FROM_BEFORE: 'Episodio iniciado antes de la ventana de recurrencia.',
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

  private captureFocus(): void {
    this.lastFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }

  private focusDialog(): void {
    setTimeout(() => this.explanationDialog?.nativeElement.focus());
  }

  private fail(errors: readonly ImportIssue[]): void {
    this.records = [];
    this.importErrors.set(errors);
    this.importedRowCount.set(0);
    this.phase.set('error');
    this.statusMessage.set(
      `La validación encontró ${errors.length} errores bloqueantes. No se ha ejecutado el análisis.`,
    );
  }

  private currentCandidateTable(): CandidateTable {
    if (this.resultView() === 'r1') {
      return {
        headers: [
          'Nº Nómina',
          'Episodios contabilizados',
          'Inicio más reciente',
          'Inicio de ventana',
          'Fin de ventana',
        ],
        rows: this.candidates().map((candidate) => [
          candidate.employeeId,
          candidate.episodeCount,
          formatSpanishDate(candidate.mostRecentStart),
          formatSpanishDate(candidate.window.start),
          formatSpanishDate(candidate.window.end),
        ]),
      };
    }

    return {
      headers: [
        'Nº Nómina',
        'Duración máxima',
        'Inicio representativo',
        'Final efectivo',
        'Centro representativo',
        'Episodios largos',
        'Estado',
      ],
      rows: this.longTop().map((candidate) => [
        candidate.employeeId,
        candidate.maximumDuration,
        formatSpanishDate(candidate.representativeEpisode.start),
        candidate.representativeEpisode.effectiveEnd
          ? formatSpanishDate(candidate.representativeEpisode.effectiveEnd)
          : '',
        candidate.representativeEpisode.workCentre,
        candidate.longEpisodeCount,
        this.longEpisodeStatus(candidate.representativeEpisode),
      ]),
    };
  }

  private candidateDetailInput(
    employeeId: string,
    view: ResultView,
  ): {
    details: readonly (readonly [string, string | number])[];
    episodes: readonly CandidateEpisodeReportRow[];
  } | null {
    if (view === 'r1') {
      const candidate = this.candidates().find((item) => item.employeeId === employeeId);
      if (!candidate) return null;
      const outcomes = new Map(
        candidate.explanation.episodes.map((item) => [
          item.episode.sourceRow,
          this.reasonLabel(item.reason),
        ]),
      );
      return {
        details: [
          ['Episodios contabilizados', candidate.episodeCount],
          ['Inicio más reciente', formatSpanishDate(candidate.mostRecentStart)],
          [
            'Ventana evaluada',
            `${formatSpanishDate(candidate.window.start)}–${formatSpanishDate(candidate.window.end)}`,
          ],
        ],
        episodes: this.reviewRows()
          .filter((row) => outcomes.has(row.sourceRow))
          .map((review) => ({ review, outcome: outcomes.get(review.sourceRow)! })),
      };
    }

    const candidate = this.longCandidates().find((item) => item.employeeId === employeeId);
    if (!candidate) return null;
    const outcomes = new Map(
      candidate.explanation.episodes.map((item) => [
        item.episode.sourceRow,
        item.representative ? 'Episodio representativo' : 'Otro episodio largo',
      ]),
    );
    return {
      details: [
        ['Duración máxima', candidate.maximumDuration],
        ['Episodios largos', candidate.longEpisodeCount],
        ['Centro representativo', candidate.representativeEpisode.workCentre],
      ],
      episodes: this.reviewRows()
        .filter((row) => outcomes.has(row.sourceRow))
        .map((review) => ({ review, outcome: outcomes.get(review.sourceRow)! })),
    };
  }

  private candidateDialogSection(
    employeeId: string,
    view: ResultView,
  ): CandidateDetailSection | null {
    const input = this.candidateDetailInput(employeeId, view);
    if (!input) return null;

    return {
      view,
      rule: view === 'r1' ? 'R1-v1' : 'R2-v1',
      title: view === 'r1' ? 'Recurrencia corta' : 'Larga duración',
      metrics: input.details,
      episodes: input.episodes.map(({ review, outcome }) => ({
        period: `${formatSpanishDate(review.start)}–${
          review.effectiveEnd ? formatSpanishDate(review.effectiveEnd) : 'fuera del corte'
        }`,
        duration:
          review.effectiveDuration === null
            ? 'Duración no disponible'
            : `${review.effectiveDuration} días`,
        centre: review.locationCode,
        outcome,
      })),
    };
  }

  private resetResults(): void {
    this.candidates.set([]);
    this.longCandidates.set([]);
    this.analysisWarnings.set([]);
    this.selectedCandidate.set(null);
    this.selectedLongCandidate.set(null);
    this.selectedCentres.set([]);
    this.resultView.set('r1');
    this.resultSection.set('r1');
    this.selectedReviewEmployeeId.set(null);
    this.reviewRows.set([]);
    this.reviewFilters.set([]);
    this.reviewFilterValue.set('');
    this.reviewStartFromIso.set('');
    this.reviewStartToIso.set('');
    this.reviewSortColumn.set('start');
    this.reviewSortDirection.set('asc');
    this.exportError.set('');
  }
}
