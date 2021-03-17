import { BehaviorSubject, Observable, of } from '@root/node_modules/rxjs';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  catchError,
  finalize
  // tslint:disable-next-line:import-blacklist
} from 'rxjs/operators';
import { CharterService } from '@app/features/charter/charter.service';

export class CharterDataSource implements DataSource<any> {
  private chartersSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loading$ = this.loadingSubject.asObservable();
  totalCount = 0;
  constructor(private service: CharterService) {}

  connect(
    collectionViewer: CollectionViewer
  ): Observable<any[] | ReadonlyArray<any>> {
    return this.chartersSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.chartersSubject.complete();
    this.loadingSubject.complete();
  }

  loadCharters(
    filter = [],
    column = 'subsidiaryName',
    sort = 'desc',
    pageIndex = 0,
    pageSize = 15,
    showInactive = false
  ) {
    this.loadingSubject.next(true);
    this.service
      .fetch(filter, pageSize, pageIndex, column, sort, showInactive)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(data => {
        console.log(data);
        // @ts-ignore
        this.totalCount = data.count;
        // @ts-ignore
        this.chartersSubject.next(data.charters);
      });
  }

  getLoadingState() {
    return this.loading$;
  }
}
