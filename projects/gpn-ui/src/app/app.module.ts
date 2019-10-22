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
import { HttpClient } from '@root/node_modules/@angular/common/http';
import {
  TranslateLoader,
  TranslateModule
} from '@root/node_modules/@ngx-translate/core';
import { TranslateHttpLoader } from '@root/node_modules/@ngx-translate/http-loader';
import localeRu from '@angular/common/locales/ru';
import { registerLocaleData } from '@root/node_modules/@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from '@app/app/http-error.interceptor';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

registerLocaleData(localeRu, 'ru');

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
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [AppComponent, HideDirective],
  exports: [HideDirective],
  bootstrap: [AppComponent],
  providers: [
    AppPageGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ]
})
export class AppModule {}
