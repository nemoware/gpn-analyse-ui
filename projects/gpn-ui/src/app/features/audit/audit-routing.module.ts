import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListAuditComponent } from '@app/features/audit/list.audit/list.audit.component';
import { AuditAnalyseResultComponent } from '@app/features/audit/audit-analyse-result/audit-analyse-result.component';
import { AuditEditorComponent } from '@app/features/audit/audit-editor/audit-editor.component';

const routes: Routes = [
  {
    path: '',
    component: ListAuditComponent,
    data: { title: 'Главная' }
  },
  {
    path: 'result/:id',
    component: AuditAnalyseResultComponent,
    data: { title: 'Результаты проверки' }
  },
  {
    path: 'view/:id',
    component: AuditEditorComponent,
    data: { title: 'Просмотр документа', editmode: false },
    runGuardsAndResolvers: 'always'
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
export class ListAuditRoutingModule {}
