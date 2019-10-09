import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const routes: Routes = [
  {
    path: 'audit',
    loadChildren: () =>
      import('./features/audit/audit.module').then(m => m.AuditModule)
  },
  {
    path: 'dash',
    loadChildren: () =>
      import('./features/dash/dash.module').then(m => m.FeatureListModule)
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.module').then(m => m.SettingsModule)
  },
  {
    path: 'analyse',
    loadChildren: () =>
      import('./features/analyse/analyse.module').then(m => m.AnalyseModule)
  },
  {
    path: '**',
    redirectTo: 'audit'
  }
];

@NgModule({
  // useHash supports github.io demo page, remove in your app
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
