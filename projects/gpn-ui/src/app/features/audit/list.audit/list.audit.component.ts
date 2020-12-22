import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuditService } from '@app/features/audit/audit.service';
import { ViewChild } from '@root/node_modules/@angular/core';
import {
  MatDialog,
  MatPaginator,
  MatSort
} from '@root/node_modules/@angular/material';
import { AuditDataSource } from '@app/features/audit/audit-data-source';
import { merge } from '@root/node_modules/rxjs';
import { tap } from '@root/node_modules/rxjs/operators';
import { DatePipe } from '@root/node_modules/@angular/common';
import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { CreateAuditComponent } from '@app/features/audit/create-audit/create-audit.component';
import { Router } from '@root/node_modules/@angular/router';
@Component({
  selector: 'gpn-list.audit',
  templateUrl: './list.audit.component.html',
  styleUrls: ['./list.audit.component.scss'],
  providers: [AuditService, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListAuditComponent implements OnInit {
  constructor(
    private auditService: AuditService,
    private spinner: NgxSpinnerService,
    private auditservice: AuditService,
    public datepipe: DatePipe,
    public dialog: MatDialog,
    private router: Router
  ) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  defPageSize = 15;
  dataSource: AuditDataSource;
  columns: string[] = [
    'subsidiaryName',
    'auditStart',
    'auditEnd',
    'checkedDocumentCount',
    'createDate',
    'status',
    'events'
  ];
  auditStatuses: string[] = [
    'InWork',
    'Loading',
    'Finalizing',
    'Done',
    'New',
    'Approved'
  ];
  _filterValue: [];
  faTrashAlt = faTrashAlt;
  mouseOverIndex = -1;

  ngOnInit() {
    this.dataSource = new AuditDataSource(this.auditService);
    this.dataSource.loadAudits([], 'createDate', 'desc', 0, this.defPageSize);
    this.dataSource.getLoadingState().subscribe(res => {
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

  deleteAudit(element, event) {
    event.stopPropagation();
    if (element != null) {
      if (
        confirm(
          `Вы действительно хотите удалить "Проверка ДО от ${this.datepipe.transform(
            element.createDate,
            'dd.MM.yyyy'
          )}"?`
        )
      ) {
        this.auditservice.deleteAudit(element._id).subscribe(
          () => this.loadAuditsPage(),
          error => {
            alert(error.message());
          }
        );
      }
    }
  }

  createAudit() {
    const dialogRef = this.dialog.open(CreateAuditComponent, {
      width: '500px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAuditsPage();
      }
    });
  }

  openAuditResult(element) {
    if (element.status !== 'New') {
      this.router.navigate(['audit/result/', element._id]);
    }
  }

  onMouseOver(index) {
    this.mouseOverIndex = index;
  }
}
