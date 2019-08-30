import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventViewerComponent } from '@app/features/events/event.viewer/event.viewer.component';

const routes: Routes = [
  {
    path: '',
    component: EventViewerComponent,
    data: { title: 'gpn.menu.event.viewer' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventViewerRoutingModule {}
