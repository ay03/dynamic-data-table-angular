import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TableDemoComponent } from './table-demo/table-demo.component';

import { routes } from './app.routes';

export const appConfig = {
  providers: [
    provideRouter([
      { path: '', component: TableDemoComponent }
    ])
  ]
};