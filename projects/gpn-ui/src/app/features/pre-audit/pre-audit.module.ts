import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreAuditRoutingModule } from './pre-audit-routing.module';
import { ListPreAuditComponent } from './list-pre-audit/list-pre-audit.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [ListPreAuditComponent],
  imports: [CommonModule, PreAuditRoutingModule, SharedModule]
})
export class PreAuditModule {}
