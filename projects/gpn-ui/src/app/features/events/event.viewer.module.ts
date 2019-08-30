import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { EventViewerComponent } from '@app/features/events/event.viewer/event.viewer.component';
import { EventViewerRoutingModule } from '@app/features/events/event.viewer.routing.module';
import { EventFilterComponent } from '@app/features/events/events.filter/events.filter.component';
import { DateAdapter, MAT_DATE_FORMATS } from '@root/node_modules/@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from '@app/features/analyse/search/doc-filter/app-date-adapter';


@NgModule({
  declarations: [EventViewerComponent, EventFilterComponent],
  entryComponents: [],
  imports: [CommonModule, SharedModule, EventViewerRoutingModule],
  providers: [{
    provide: DateAdapter, useClass: AppDateAdapter
  },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }]
})
export class EventViewerModule {}
