import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core/core.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app/app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HideDirective } from '@core/authorization/hide.directive';
import { AppPageGuard } from '@core/authorization/app.page.guard';
import { FormsModule } from '@root/node_modules/@angular/forms';

@NgModule({
  imports: [
    // angular
    NoopAnimationsModule,
    BrowserModule,

    // core & shared
    CoreModule,
    SharedModule,
    FormsModule,
    // app
    AppRoutingModule
  ],
  declarations: [AppComponent, HideDirective],
  exports: [HideDirective],
  bootstrap: [AppComponent],
  providers: [AppPageGuard]
})
export class AppModule {}
