import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthorizationGuard } from '@core/authorization/authorization.guard';
import { EventViewerGuard } from '@core/authorization/event.viewer.guard';
import { AnalyseGuard } from '@core/authorization/analyse.guard';

const routes: Routes = [
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
    canActivate: [AnalyseGuard],
    loadChildren: () =>
      import('./features/analyse/analyse.module').then(m => m.AnalyseModule)
  },
  {
    path: 'admin',
    canActivate: [AuthorizationGuard],
    loadChildren: () =>
      import('./features/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'event',
    canActivate: [EventViewerGuard],
    loadChildren: () =>
      import('./features/events/event.viewer.module').then(m => m.EventViewerModule)
  },
  {
    path: '**',
    redirectTo: 'dash'
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
