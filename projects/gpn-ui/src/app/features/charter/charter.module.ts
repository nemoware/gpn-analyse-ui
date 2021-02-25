import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListCharterComponent } from './list-charter/list.charter.component';
import { ListCharterRoutingModule } from '@app/features/charter/charter-routing.module';
import { SharedModule } from '@shared/shared.module';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from '@root/node_modules/@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from '@app/format/app-date-adapter';
import { LOCALE_ID } from '@root/node_modules/@angular/core';
import { CreateCharterComponent } from './create-charter/create-charter.component';
import { NgxMatSelectSearchModule } from '@root/node_modules/ngx-mat-select-search';
import { AuditModule } from '@app/features/audit/audit.module';
import { TestComponent } from './test/test.component';
import { NgxSpinnerModule } from '@root/node_modules/ngx-spinner';
import { CharterFilterComponent } from './charter-filter/charter-filter.component';

@NgModule({
  declarations: [
    ListCharterComponent,
    CreateCharterComponent,
    TestComponent,
    CharterFilterComponent
  ],
  imports: [
    CommonModule,
    ListCharterRoutingModule,
    SharedModule,
    NgxMatSelectSearchModule,
    AuditModule,
    NgxSpinnerModule
  ],
  entryComponents: [CreateCharterComponent],
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
export class CharterModule {}
