import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LimitValuesTableComponent } from '@app/features/handbook/limit-values/limit-values-table/limit-values-table.component';

const routes: Routes = [
  {
    path: '',
    component: LimitValuesTableComponent,
    data: { title: 'Предельные значения' }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LimitValuesRoutingModule {}
