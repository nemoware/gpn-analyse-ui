import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreAuditRoutingModule } from './pre-audit-routing.module';
import { ListPreAuditComponent } from './list-pre-audit/list-pre-audit.component';
import { SharedModule } from '@shared/shared.module';
import { NgxSpinnerModule } from '@root/node_modules/ngx-spinner';
import { TranslateModule } from '@root/node_modules/@ngx-translate/core';

@NgModule({
  declarations: [ListPreAuditComponent],
  imports: [
    CommonModule,
    PreAuditRoutingModule,
    SharedModule,
    NgxSpinnerModule,
    TranslateModule
  ]
})
export class PreAuditModule {}
