import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch(() => {
  document.body.textContent =
    'AbsenceLens no se pudo iniciar. Recarga la página para volver a intentarlo.';
});
