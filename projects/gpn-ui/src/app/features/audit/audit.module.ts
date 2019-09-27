import { NgModule } from '@angular/core';
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
  MatSelectModule
} from '@root/node_modules/@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from '@app/format/app-date-adapter';

@NgModule({
  declarations: [ListAuditComponent, CreateAuditComponent],
  imports: [
    CommonModule,
    SharedModule,
    ListAuditRoutingModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    NgxMatSelectSearchModule
  ],
  entryComponents: [CreateAuditComponent],
  providers: [
    {
      provide: DateAdapter,
      useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS
    }
  ]
})
export class AuditModule {}
