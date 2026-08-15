import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

export type CandidateDetailView = 'r1' | 'r2';

export interface CandidateDetailEpisode {
  readonly period: string;
  readonly duration: string;
  readonly centre: string;
  readonly outcome: string;
}

export interface CandidateDetailSection {
  readonly view: CandidateDetailView;
  readonly rule: string;
  readonly title: string;
  readonly metrics: readonly (readonly [string, string | number])[];
  readonly episodes: readonly CandidateDetailEpisode[];
}

export interface CandidateDetailDialogData {
  readonly employeeId: string;
  readonly cutoff: string;
  readonly sections: readonly CandidateDetailSection[];
}

@Component({
  selector: 'app-candidate-detail-dialog',
  imports: [MatDialogModule, MatButtonModule, MatTooltipModule, TranslatePipe],
  template: `
    <header class="dialog-heading">
      <div>
        <p>{{ 'dialog.eyebrow' | translate }}</p>
        <h2 mat-dialog-title>
          {{ 'dialog.payrollTitle' | translate: { employeeId: data.employeeId } }}
        </h2>
        <span>{{ 'dialog.cutoff' | translate: { cutoff: data.cutoff } }}</span>
      </div>
      <button
        mat-button
        type="button"
        mat-dialog-close
        [attr.aria-label]="'dialog.closeLabel' | translate"
      >
        {{ 'common.close' | translate }}
      </button>
    </header>

    <mat-dialog-content>
      @for (section of data.sections; track section.view) {
        <section class="rule-section">
          <div class="section-heading">
            <div>
              <h3>{{ section.title }}</h3>
            </div>
            <button
              mat-stroked-button
              type="button"
              [matTooltip]="'dialog.exportTooltip' | translate"
              (click)="export(section.view)"
            >
              {{ 'common.exportExcel' | translate }}
            </button>
          </div>

          <dl>
            @for (metric of section.metrics; track metric[0]) {
              <div>
                <dt>{{ metric[0] }}</dt>
                <dd>{{ metric[1] }}</dd>
              </div>
            }
          </dl>

          <div class="episode-list" [attr.aria-label]="'dialog.episodesLabel' | translate">
            @for (episode of section.episodes; track $index) {
              <article>
                <div>
                  <strong>{{ episode.period }}</strong>
                  <span>{{ episode.outcome }}</span>
                </div>
                <small
                  >{{ episode.duration }} ·
                  {{ 'dialog.centre' | translate: { centre: episode.centre } }}</small
                >
              </article>
            }
          </div>
        </section>
      }
    </mat-dialog-content>
  `,
  styles: `
    :host {
      display: block;
      color: #17343b;
    }
    .dialog-heading {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 2rem;
      padding: 1.25rem 1.5rem 0.75rem;
      border-bottom: 1px solid #d7e3e6;
    }
    .dialog-heading p,
    .dialog-heading h2 {
      margin: 0;
    }
    .dialog-heading p {
      color: #087f8c;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .dialog-heading span {
      color: #587078;
      font-size: 0.875rem;
    }
    [mat-dialog-title] {
      padding: 0.25rem 0;
    }
    mat-dialog-content {
      width: min(880px, 82vw);
      max-height: 72vh;
      padding: 1.25rem 1.5rem 1.5rem;
    }
    .rule-section + .rule-section {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid #d7e3e6;
    }
    .section-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .section-heading span {
      color: #087f8c;
      font-weight: 800;
    }
    h3 {
      margin: 0.15rem 0;
      font-size: 1.1rem;
    }
    dl {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
      margin: 1rem 0;
    }
    dl div {
      padding: 0.75rem;
      border-radius: 0.65rem;
      background: #f0f6f7;
    }
    dt {
      color: #587078;
      font-size: 0.78rem;
    }
    dd {
      margin: 0.2rem 0 0;
      font-weight: 750;
    }
    .episode-list {
      display: grid;
      gap: 0.55rem;
    }
    article {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 0.85rem;
      border: 1px solid #d7e3e6;
      border-radius: 0.55rem;
    }
    article div {
      display: grid;
      gap: 0.15rem;
    }
    article span,
    article small {
      color: #587078;
    }
    @media (max-width: 680px) {
      mat-dialog-content {
        width: auto;
      }
      .dialog-heading,
      .section-heading,
      article {
        align-items: stretch;
        flex-direction: column;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateDetailDialogComponent {
  protected readonly data = inject<CandidateDetailDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CandidateDetailDialogComponent>);

  protected export(view: CandidateDetailView): void {
    this.dialogRef.close({ exportView: view });
  }
}
