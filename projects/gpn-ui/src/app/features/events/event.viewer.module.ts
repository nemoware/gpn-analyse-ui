import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

import { EventViewerRoutingModule } from '@app/features/events/event.viewer.routing.module';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from '@root/node_modules/@angular/material';

import { EventViewerComponent } from '@app/features/events/events/event.viewer.component';
import { APP_DATE_FORMATS, AppDateAdapter } from '@app/format/app-date-adapter';
import { FilterModule } from '../filter/filter.module';

@NgModule({
  declarations: [EventViewerComponent],
  entryComponents: [],
  imports: [CommonModule, SharedModule, EventViewerRoutingModule, FilterModule],
  providers: [
    {
      provide: DateAdapter,
      useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: APP_DATE_FORMATS
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' }
  ]
})
export class EventViewerModule {}
