import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RiskMatrixTableComponent } from '@app/features/handbook/risk-matrix/risk-matrix-table/risk-matrix-table.component';

const routes: Routes = [
  {
    path: '',
    component: RiskMatrixTableComponent,
    data: { title: 'Матрица рисков' }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RiskMatrixRoutingModule {}
