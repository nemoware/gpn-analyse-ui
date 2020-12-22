import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RiskMatrixRoutingModule } from './risk-matrix-routing.module';
import { RiskMatrixTableComponent } from './risk-matrix-table/risk-matrix-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from '@shared/shared.module';
import { RiskMatrixFormComponent } from './risk-matrix-form/risk-matrix-form.component';
import { TranslateModule } from '@root/node_modules/@ngx-translate/core';

@NgModule({
  declarations: [RiskMatrixTableComponent, RiskMatrixFormComponent],
  imports: [
    CommonModule,
    RiskMatrixRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    SharedModule,
    TranslateModule
  ],
  entryComponents: [RiskMatrixFormComponent]
})
export class RiskMatrixModule {}
