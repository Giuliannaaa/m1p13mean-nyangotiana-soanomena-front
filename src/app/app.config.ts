import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { Chart, registerables } from 'chart.js';
import { authInterceptor } from './interceptors/auth.interceptor';

Chart.register(...registerables);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideHttpClient(
      withInterceptors([authInterceptor]) // ← ajouter ici
    ),
        provideZoneChangeDetection({ eventCoalescing: true })
    ]
};