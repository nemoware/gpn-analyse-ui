import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LimitValuesRoutingModule } from './limit-values-routing.module';
import { LimitValuesTableComponent } from './limit-values-table/limit-values-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from '@shared/shared.module';
import { LimitValuesFormComponent } from './limit-values-form/limit-values-form.component';
import { TranslateModule } from '@root/node_modules/@ngx-translate/core';
import { AuditModule } from '@app/features/audit/audit.module';
import { TextMaskModule } from '@root/node_modules/angular2-text-mask';

@NgModule({
  declarations: [LimitValuesTableComponent, LimitValuesFormComponent],
  imports: [
    CommonModule,
    LimitValuesRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    SharedModule,
    TranslateModule,
    AuditModule,
    TextMaskModule
  ],
  entryComponents: [LimitValuesFormComponent]
})
export class LimitValuesModule {}
