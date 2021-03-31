import { BehaviorSubject, Observable, of } from '@root/node_modules/rxjs';
import { AuditService } from '@app/features/audit/audit.service';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  catchError,
  finalize
  // tslint:disable-next-line:import-blacklist
} from 'rxjs/operators';
import { PreAuditService } from '@app/features/pre-audit/pre-audit.service';

export class PreAuditDataSource implements DataSource<any> {
  private auditsSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loading$ = this.loadingSubject.asObservable();
  totalCount = 0;
  constructor(private service: PreAuditService) {}

  connect(
    collectionViewer: CollectionViewer
  ): Observable<any[] | ReadonlyArray<any>> {
    return this.auditsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.auditsSubject.complete();
    this.loadingSubject.complete();
  }

  loadAudits(
    filter = [],
    column = 'createDate',
    sort = 'desc',
    pageIndex = 0,
    pageSize = 15
  ) {
    this.loadingSubject.next(true);
    this.service
      .fetch(filter, pageSize, pageIndex, column, sort)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(data => {
        // @ts-ignore
        this.totalCount = data.count;
        // @ts-ignore
        this.auditsSubject.next(data.audits);
      });
  }

  getLoadingState() {
    return this.loading$;
  }
}
