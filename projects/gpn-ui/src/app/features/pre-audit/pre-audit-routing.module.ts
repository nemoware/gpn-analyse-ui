import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListPreAuditComponent } from '@app/features/pre-audit/list-pre-audit/list-pre-audit.component';
import { PreAuditAnalyseResultComponent } from '@app/features/pre-audit/pre-audit-analyse-result/pre-audit-analyse-result.component';
import { AuditEditorComponent } from '@app/features/audit/audit-editor/audit-editor.component';

const routes: Routes = [
  {
    path: '',
    component: ListPreAuditComponent,
    data: { title: 'Предварительный аудит' }
  },
  {
    path: 'result/:id',
    component: PreAuditAnalyseResultComponent,
    data: { title: 'Результаты проверки' }
  },
  {
    path: 'edit/:id',
    component: AuditEditorComponent,
    data: { title: 'Редактирование документа', editmode: true }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreAuditRoutingModule {}
