import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AffiliatesListTableComponent } from '@app/features/handbook/affiliates-list/affiliates-list-table/affiliates-list-table.component';

const routes: Routes = [
  {
    path: '',
    component: AffiliatesListTableComponent,
    data: { title: 'Список аффилированных лиц' }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AffiliatesListRoutingModule {}
