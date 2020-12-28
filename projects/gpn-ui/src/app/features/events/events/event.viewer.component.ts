import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild,
  OnDestroy
} from '@angular/core';

import { EventViewerService } from '@app/features/events/event.viewer.service';
import { MatPaginator, MatSort } from '@root/node_modules/@angular/material';
import { EventDataSource } from '@app/features/events/event-data-source';
import { tap } from 'rxjs/operators';
import { merge, Subject } from '@root/node_modules/rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'gpn-event.viewer',
  templateUrl: './event.viewer.component.html',
  styleUrls: ['./event.viewer.component.scss'],
  providers: [EventViewerService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(private eventviewerservice: EventViewerService) {}

  count = 0;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  defPageSize = 20;
  dataSource: EventDataSource;
  displayedColumns: string[] = ['time', 'login', 'name', 'details'];
  eventsType = [];
  _filterValue: [];
  private destroyStream = new Subject<void>();

  ngOnInit() {
    this.dataSource = new EventDataSource(this.eventviewerservice);
    this.dataSource.loadEvents([], 'time', 'desc', 0, this.defPageSize);

    this.eventviewerservice
      .getEventsType()
      .pipe(takeUntil(this.destroyStream))
      .subscribe(value => (this.eventsType = value));
  }

  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadEventsPage()))
      .subscribe();
  }

  loadEventsPage() {
    this.dataSource.loadEvents(
      this._filterValue,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  onApplyFilter(filterVlaue) {
    this._filterValue = filterVlaue;
    this.paginator.pageIndex = 0;
    this.loadEventsPage();
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
