import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dash.component';

 

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: { title: 'Дэшборд' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeatureListRoutingModule {}
