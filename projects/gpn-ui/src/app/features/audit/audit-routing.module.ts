import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListAuditComponent } from '@app/features/audit/list.audit/list.audit.component';
import { AuditAnalyseResultComponent } from '@app/features/audit/audit-analyse-result/audit-analyse-result.component';

const routes: Routes = [
  {
    path: '',
    component: ListAuditComponent,
    data: { title: 'Аудит' }
  },
  { path: ':id', component: AuditAnalyseResultComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListAuditRoutingModule {}
