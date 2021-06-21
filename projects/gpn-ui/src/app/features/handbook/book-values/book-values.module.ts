import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookValuesRoutingModule } from './book-values-routing.module';
import { BookValuesTableComponent } from './book-values-table/book-values-table.component';
import { SharedModule } from '@shared/shared.module';
import { BookValuesFormComponent } from './book-values-form/book-values-form.component';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from '@root/node_modules/@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from '@app/format/app-date-adapter';
import { LOCALE_ID } from '@root/node_modules/@angular/core';
import { NgxMaskModule } from '@root/node_modules/ngx-mask';

@NgModule({
  declarations: [BookValuesTableComponent, BookValuesFormComponent],
  imports: [CommonModule, BookValuesRoutingModule, SharedModule, NgxMaskModule],
  entryComponents: [BookValuesFormComponent],
  providers: [
    {
      provide: DateAdapter,
      useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    { provide: LOCALE_ID, useValue: 'ru' }
  ]
})
export class BookValuesModule {}
