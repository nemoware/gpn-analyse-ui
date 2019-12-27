import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AppPageGuard } from '@core/authorization/app.page.guard';

const routes: Routes = [
  {
    path: 'audit',
    loadChildren: () =>
      import('./features/audit/audit.module').then(m => m.AuditModule),
    canActivate: [AppPageGuard],
    data: { appPage: 'audit' }
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
      import('./features/analyse/analyse.module').then(m => m.AnalyseModule),
    canActivate: [AppPageGuard],
    data: { appPage: 'analyse' }
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AppPageGuard],
    data: { appPage: 'admin' }
  },
  {
    path: 'events',
    loadChildren: () =>
      import('./features/events/event.viewer.module').then(
        m => m.EventViewerModule
      ),
    canActivate: [AppPageGuard],
    data: { appPage: 'events' }
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
      preloadingStrategy: PreloadAllModules,
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
