import { BehaviorSubject, Observable, of } from '@root/node_modules/rxjs';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  catchError,
  finalize
  // tslint:disable-next-line:import-blacklist
} from 'rxjs/operators';
import { HandBookService } from '@app/features/handbook/hand-book.service';

export class AffiliatesListDataSource implements DataSource<any> {
  private affiliatesSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loading$ = this.loadingSubject.asObservable();
  totalCount = 0;
  constructor(private service: HandBookService) {}

  connect(
    collectionViewer: CollectionViewer
  ): Observable<any[] | ReadonlyArray<any>> {
    return this.affiliatesSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.affiliatesSubject.complete();
    this.loadingSubject.complete();
  }

  loadAffiliates(
    filter = [],
    column = 'name',
    sort = 'asc',
    pageIndex = 0,
    pageSize = 15
  ) {
    this.loadingSubject.next(true);
    this.service
      .fetchAffiliates(filter, pageSize, pageIndex, column, sort)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(data => {
        // console.log(data);
        // @ts-ignore
        this.totalCount = data.count;
        // @ts-ignore
        this.affiliatesSubject.next(data.affiliates);
      });
  }

  getLoadingState() {
    return this.loading$;
  }
}
