import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { PreAuditService } from '@app/features/pre-audit/pre-audit.service';
import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';
import {
  MatDialog,
  MatPaginator,
  MatSort
} from '@root/node_modules/@angular/material';
import { Router } from '@root/node_modules/@angular/router';
import { merge, Subject } from '@root/node_modules/rxjs';
import { takeUntil, tap } from '@root/node_modules/rxjs/operators';
import { PreAuditDataSource } from '@app/features/pre-audit/pre-audit-data-source';
import { CreatePreAuditComponent } from '@app/features/pre-audit/create-pre-audit/create-pre-audit.component';
import { AppPages } from '@app/models/app.pages';

@Component({
  selector: 'gpn-list-pre-audit',
  templateUrl: './list-pre-audit.component.html',
  styleUrls: ['./list-pre-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPreAuditComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  constructor(
    private preAuditService: PreAuditService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private router: Router
  ) {}

  defPageSize = 15;
  dataSource: PreAuditDataSource;
  columns: string[] = ['user', 'checkType', 'files', 'createDate', 'status'];
  auditStatuses: string[] = [
    'InWork',
    'Loading',
    'Finalizing',
    'Done',
    'New',
    'Approved'
  ];
  _filterValue: Object[] = [];
  mouseOverIndex = -1;
  private destroyStream = new Subject<void>();
  eAppPage = AppPages;

  ngOnInit() {
    this.dataSource = new PreAuditDataSource(this.preAuditService);
    this.dataSource.loadAudits([], 'createDate', 'desc', 0, this.defPageSize);
    this.dataSource
      .getLoadingState()
      .pipe(takeUntil(this.destroyStream))
      .subscribe(res => {
        if (res) {
          this.spinner.show();
        } else {
          this.spinner.hide();
        }
      });
  }

  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadAuditsPage()))
      .subscribe();
  }

  loadAuditsPage() {
    this.dataSource.loadAudits(
      this._filterValue,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  onApplyFilter(filterValue) {
    this._filterValue = filterValue;
    this.paginator.pageIndex = 0;
    this.loadAuditsPage();
  }

  openAuditResult(element) {
    if (element.status !== 'New') {
      this.router.navigate(['audit/result/', element._id]);
    }
  }

  onMouseOver(index) {
    this.mouseOverIndex = index;
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }

  createAudit() {
    const dialogRef = this.dialog.open(CreatePreAuditComponent, {
      width: '40%',
      data: {}
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadAuditsPage();
    });
  }
}
