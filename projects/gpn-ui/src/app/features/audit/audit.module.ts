import {
  TRANSLATIONS,
  TRANSLATIONS_FORMAT,
  LOCALE_ID,
  NgModule
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListAuditComponent } from '@app/features/audit/list.audit/list.audit.component';
import { SharedModule } from '@shared/shared.module';
import { ListAuditRoutingModule } from '@app/features/audit/audit-routing.module';
import { CreateAuditComponent } from './create-audit/create-audit.component';
import { NgxMatSelectSearchModule } from '@root/node_modules/ngx-mat-select-search';
import { ReactiveFormsModule } from '@root/node_modules/@angular/forms';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatFormFieldModule,
  MatSelectModule,
  MAT_DATE_LOCALE,
  MatTreeModule,
  MatDialogModule
} from '@root/node_modules/@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from '@app/format/app-date-adapter';
import { FontAwesomeModule } from '@root/node_modules/@fortawesome/angular-fontawesome';
import { AuditResultComponent } from './audit-result/audit-result.component';
import { ScrollingModule } from '@root/node_modules/@angular/cdk/scrolling';
import { TranslateModule } from '@root/node_modules/@ngx-translate/core';

@NgModule({
  declarations: [
    ListAuditComponent,
    CreateAuditComponent,
    AuditResultComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ListAuditRoutingModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule,
    FontAwesomeModule,
    MatTreeModule,
    MatDialogModule,
    ScrollingModule,
    TranslateModule
  ],
  entryComponents: [CreateAuditComponent, AuditResultComponent],
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
export class AuditModule {}
