import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app/app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthorizationGuard } from '@core/authorization/authorization.guard';
import { EventViewerGuard } from '@core/authorization/event.viewer.guard';
import { AnalyseGuard } from '@core/authorization/analyse.guard';
import { AdminModule } from '@app/features/admin/admin.module';
import { AuthorizationData } from '@core/authorization/authorization.data';

@NgModule({
  imports: [
    // angular
    NoopAnimationsModule,
    BrowserModule,

    // core & shared
    CoreModule,
    SharedModule,

    // app
    AppRoutingModule,
    AdminModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [AuthorizationGuard, EventViewerGuard, AnalyseGuard, AuthorizationData]
})
export class AppModule { }
