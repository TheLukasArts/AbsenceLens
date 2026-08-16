import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-clear-session-dialog',
  imports: [MatButtonModule, MatDialogModule, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'session.confirmTitle' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'session.confirmDescription' | translate }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="false">
        {{ 'common.cancel' | translate }}
      </button>
      <button mat-flat-button type="button" [mat-dialog-close]="true">
        {{ 'session.confirmAction' | translate }}
      </button>
    </mat-dialog-actions>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClearSessionDialogComponent {}
