import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListAuditComponent } from '@app/features/audit/list.audit/list.audit.component';

const routes: Routes = [
  {
    path: '',
    component: ListAuditComponent,
    data: { title: 'Аудит' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListAuditRoutingModule {}
