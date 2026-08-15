import { Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ES_TRANSLATIONS } from './es';

@Injectable()
export class StaticSpanishLoader extends TranslateLoader {
  override getTranslation(_language: string): Observable<TranslationObject> {
    return of(ES_TRANSLATIONS);
  }
}
