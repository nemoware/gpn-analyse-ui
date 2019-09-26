import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListAuditComponent } from '@app/features/audit/list.audit/list.audit.component';
import { SharedModule } from '@shared/shared.module';
import { ListAuditRoutingModule } from '@app/features/audit/audit-routing.module';
import { CreateAuditComponent } from './create-audit/create-audit.component';
import { NgxMatSelectSearchModule } from '@root/node_modules/ngx-mat-select-search';
import { ReactiveFormsModule } from '@root/node_modules/@angular/forms';
import {
  MatFormFieldModule,
  MatSelectModule
} from '@root/node_modules/@angular/material';

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
  entryComponents: [CreateAuditComponent]
})
export class AuditModule {}
