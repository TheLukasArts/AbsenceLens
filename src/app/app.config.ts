import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateLoader, provideTranslateService } from '@ngx-translate/core';

import { routes } from './app.routes';
import { StaticSpanishLoader } from './i18n/static-spanish-loader';

export const provideAppTranslations = () =>
  provideTranslateService({
    loader: provideTranslateLoader(StaticSpanishLoader),
    fallbackLang: 'es',
    lang: 'es',
  });

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAppTranslations(),
  ],
};
