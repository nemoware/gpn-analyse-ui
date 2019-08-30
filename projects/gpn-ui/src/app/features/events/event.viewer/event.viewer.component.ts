import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild,
  Input
} from '@angular/core';
import { EventApp } from '@app/models/event.model';
import { EventViewerService } from '@app/features/events/event.viewer.service';
import { merge, of as observableOf } from '@root/node_modules/rxjs';
import { catchError, map, startWith, switchMap } from '@root/node_modules/rxjs/internal/operators';
import { MatPaginator, MatSort } from '@root/node_modules/@angular/material';


@Component({
  selector: 'gpn-event.viewer',
  templateUrl: './event.viewer.component.html',
  styleUrls: ['./event.viewer.component.scss'],
  providers: [EventViewerService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewerComponent implements OnInit, AfterViewInit {

  constructor(private events : EventViewerService, private changeDetectorRefs: ChangeDetectorRef) { }
  isLoadingResults = true;
  eventsApp: EventApp[];
  resultsLength = 0;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false })
  sort: MatSort;
  _filterVlaue : Array<{name: string, value: any}>;
  displayedColumns: string[] = ['createdAt', 'login', 'value'];
  eventsType: Array<{id: string, name: string}>;

  ngOnInit() {
  }

  ngAfterViewInit() {

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.events.getEventsApp(this._filterVlaue,
            this.sort.active, this.sort.direction, this.paginator.pageIndex);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = 10;
          return data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        })
      ).subscribe(data => {
      this.eventsApp = data;
      this.changeDetectorRefs.detectChanges();
    });

    this.events.getEventsType().subscribe(value => this.eventsType = value);
  }

  onApplyFilter(filterVlaue : Array<{name: string, value: any}>) {

    this.isLoadingResults = true;
    this._filterVlaue = filterVlaue;
    this.events.getEventsApp(this._filterVlaue, this.sort.active, this.sort.direction, this.paginator.pageIndex).
    subscribe(data => {
      this.eventsApp = data;
      this.isLoadingResults = false;
      this.changeDetectorRefs.detectChanges();
    });
  }

}
