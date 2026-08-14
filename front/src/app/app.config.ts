import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';


import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';
import { providePrimeNG } from 'primeng/config';
import { AuthInterceptor } from './services/auth-interceptor';

// Primaire magenta (charte PCA Grenoble) appliquée au preset Aura.
const FftaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fdf2f9',
      100: '#fce7f3',
      200: '#f9cfe6',
      300: '#f39ad1',
      400: '#ec5cb0',
      500: '#e5289d',
      600: '#c32285',
      700: '#901160',
      800: '#7e0f54',
      900: '#6a0d47',
      950: '#45082e',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: FftaPreset,
        options: {
          // Clair uniquement : sélecteur de mode sombre jamais appliqué.
          darkModeSelector: '.app-dark-never',
        },
      },
    }),
  ],
};