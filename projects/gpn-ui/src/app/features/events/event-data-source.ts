import { BehaviorSubject, Observable, of } from '@root/node_modules/rxjs';
import { EventViewerService } from '@app/features/events/event.viewer.service';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  catchError,
  finalize
  // tslint:disable-next-line:import-blacklist
} from 'rxjs/operators';

export class EventDataSource implements DataSource<any> {
  private eventsSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  totalCount = 0;
  constructor(private service: EventViewerService) {}

  connect(
    collectionViewer: CollectionViewer
  ): Observable<any[] | ReadonlyArray<any>> {
    return this.eventsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.eventsSubject.complete();
    this.loadingSubject.complete();
  }

  loadEvents(
    filter = [],
    column = 'time',
    sort = 'desc',
    pageIndex = 0,
    pageSize = 15
  ) {
    this.loadingSubject.next(true);
    this.service
      .getEventsApp(filter, pageSize, pageIndex, column, sort)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(data => {
        // @ts-ignore
        this.totalCount = data.count;
        // @ts-ignore
        this.eventsSubject.next(data.items);
      });
  }
}
