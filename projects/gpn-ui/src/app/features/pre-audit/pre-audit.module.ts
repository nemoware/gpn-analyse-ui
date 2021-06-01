import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreAuditRoutingModule } from './pre-audit-routing.module';
import { ListPreAuditComponent } from './list-pre-audit/list-pre-audit.component';
import { SharedModule } from '@shared/shared.module';
import { NgxSpinnerModule } from '@root/node_modules/ngx-spinner';
import { TranslateModule } from '@root/node_modules/@ngx-translate/core';
import { PreAuditFilterComponent } from './pre-audit-filter/pre-audit-filter.component';
import { CreatePreAuditComponent } from './create-pre-audit/create-pre-audit.component';
import { FilterModule } from '../filter/filter.module';

@NgModule({
  declarations: [
    ListPreAuditComponent,
    PreAuditFilterComponent,
    CreatePreAuditComponent
  ],
  entryComponents: [CreatePreAuditComponent],
  imports: [
    CommonModule,
    PreAuditRoutingModule,
    SharedModule,
    NgxSpinnerModule,
    TranslateModule,
    FilterModule
  ]
})
export class PreAuditModule {}
