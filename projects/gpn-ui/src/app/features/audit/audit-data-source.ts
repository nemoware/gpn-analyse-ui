import { BehaviorSubject, Observable, of } from '@root/node_modules/rxjs';
import { AuditService } from '@app/features/audit/audit.service';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  catchError,
  finalize
  // tslint:disable-next-line:import-blacklist
} from 'rxjs/operators';

export class AuditDataSource implements DataSource<any> {
  private auditsSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loading$ = this.loadingSubject.asObservable();
  totalCount = 0;
  documentType: string;
  constructor(private service: AuditService) {}

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

  loadContract(
    auditId,
    documentId = '',
    documentType = '',
    pageSize = 15,
    pageIndex = 0,
    column = 'subsidiaryName',
    sort = 'asc'
  ) {
    this.loadingSubject.next(true);
    this.service
      .getTreeDocument(
        auditId,
        documentId,
        documentType,
        pageSize,
        pageIndex,
        column,
        sort
      )
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(data => {
        // @ts-ignore
        this.totalCount = data.count;

        console.log(data);

        // @ts-ignore
        data.arrOfRequiredContract.map(i => {
          if (
            i.parse.documentType !== 'ANNEX' &&
            i.parse.documentType !== 'SUPPLEMENTARY_AGREEMENT'
          ) {
            i.analysis.attributes_tree.contract =
              i.analysis.attributes_tree[i.parse.documentType.toLowerCase()];
          }
        });
        // @ts-ignore
        if (data.arrOfRequiredContract) {
          // @ts-ignore
          this.documentType = data.arrOfRequiredContract[0].parse.documentType;
        }
        // @ts-ignore
        this.auditsSubject.next(data.arrOfRequiredContract);
      });
  }

  loadNotUsedDocuments(
    auditId,
    documentType = '',
    pageSize = 15,
    pageIndex = 0,
    column = 'subsidiaryName',
    sort = 'asc'
  ) {
    this.loadingSubject.next(true);
    this.service
      .getNotUsedDocuments(
        auditId,
        documentType,
        pageSize,
        pageIndex,
        column,
        sort
      )
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(data => {
        // @ts-ignore
        this.totalCount = data.count;
        // @ts-ignore
        data.arrOfRequiredContract.map(i => {
          if (
            i.parse.documentType !== 'ANNEX' &&
            i.parse.documentType !== 'SUPPLEMENTARY_AGREEMENT'
          ) {
            i.analysis.attributes_tree.contract =
              i.analysis.attributes_tree[i.parse.documentType.toLowerCase()];
          }
        });
        // @ts-ignore
        this.documentType = data.arrOfRequiredContract[0].parse.documentType;
        // @ts-ignore
        this.auditsSubject.next(data.arrOfRequiredContract);
      });
  }
  getLoadingState() {
    return this.loading$;
  }
}
