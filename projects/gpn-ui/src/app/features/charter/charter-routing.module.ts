import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListCharterComponent } from '@app/features/charter/list-charter/list.charter.component';

const routes: Routes = [
  {
    path: '',
    component: ListCharterComponent,
    data: { title: 'Уставы' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListCharterRoutingModule {}
