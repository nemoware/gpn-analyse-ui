import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookValuesTableComponent } from '@app/features/handbook/book-values/book-values-table/book-values-table.component';

const routes: Routes = [
  {
    path: '',
    component: BookValuesTableComponent,
    data: { title: 'Балансовые стоимости' }
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookValuesRoutingModule {}
