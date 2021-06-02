import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreAuditRoutingModule } from './pre-audit-routing.module';
import { ListPreAuditComponent } from './list-pre-audit/list-pre-audit.component';
import { SharedModule } from '@shared/shared.module';
import { NgxSpinnerModule } from '@root/node_modules/ngx-spinner';
import { TranslateModule } from '@root/node_modules/@ngx-translate/core';
import { CreatePreAuditComponent } from './create-pre-audit/create-pre-audit.component';
import { PreAuditAnalyseResultComponent } from './pre-audit-analyse-result/pre-audit-analyse-result.component';
import { MatTreeModule } from '@root/node_modules/@angular/material';
import { AuditModule } from '@app/features/audit/audit.module';
import { ViolationsPreAuditComponent } from './pre-audit-analyse-result/violations-pre-audit/violations-pre-audit.component';
import { PreAuditDetailComponent } from './pre-audit-analyse-result/pre-audit-detail/pre-audit-detail.component';
import { FilterModule } from '../filter/filter.module';

@NgModule({
  declarations: [
    ListPreAuditComponent,
    CreatePreAuditComponent,
    PreAuditAnalyseResultComponent,
    ViolationsPreAuditComponent,
    PreAuditDetailComponent
  ],
  entryComponents: [CreatePreAuditComponent],
  imports: [
    CommonModule,
    PreAuditRoutingModule,
    SharedModule,
    NgxSpinnerModule,
    TranslateModule,
    MatTreeModule,
    AuditModule,
    TranslateModule,
    FilterModule
  ]
})
export class PreAuditModule {}
