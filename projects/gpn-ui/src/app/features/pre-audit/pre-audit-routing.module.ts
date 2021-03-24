import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListPreAuditComponent } from '@app/features/pre-audit/list-pre-audit/list-pre-audit.component';

const routes: Routes = [
  {
    path: '',
    component: ListPreAuditComponent,
    data: { title: 'Предварительный аудит' }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreAuditRoutingModule {}
