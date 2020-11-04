import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {
  MatDialog,
  MatPaginator,
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { Audit } from '@app/models/audit.model';
import { AuditService } from '@app/features/audit/audit.service';
import { CreateAuditComponent } from '@app/features/audit/create-audit/create-audit.component';
import { DatePipe } from '@root/node_modules/@angular/common';
import {
  faSearch,
  faAngleDown,
  faCommentDots,
  faTrashAlt,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import { AuditResultComponent } from '@app/features/audit/audit-parser-result/audit-parser-result.component';
import { Router } from '@root/node_modules/@angular/router';
import { SubscriptionLike } from '@root/node_modules/rxjs';

@Component({
  selector: 'gpn-list.audit',
  templateUrl: './list.audit.component.html',
  styleUrls: ['./list.audit.component.scss'],
  providers: [AuditService, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListAuditComponent implements OnInit, AfterViewInit, OnDestroy {
  faSearch = faSearch;
  faAngleDown = faAngleDown;
  faTrashAlt = faTrashAlt;
  faCircle = faCircle;
  columns: string[] = [
    'subsidiaryName',
    'auditStart',
    'auditEnd',
    'checkedDocumentCount',
    'createDate',
    'status',
    'events'
  ];

  dataSource = new MatTableDataSource();
  activePageDataChunk = [];
  audits: Audit[];
  count = 0;
  pageIndex = 0;
  pageSize = 15;
  lowValue = 0;
  highValue = 15;
  mouseOverIndex = -1;
  delete = false;
  subscription: SubscriptionLike;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private auditservice: AuditService,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    public datepipe: DatePipe,
    private router: Router
  ) {}
  ngOnInit() {
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
  }

  ngAfterViewInit(): void {
    this.refreshData();
  }

  refreshData(filter: Array<{ name: string; value: string }> = null) {
    this.subscription = this.auditservice.getAudits(filter).subscribe(data => {
      this.audits = data;
      // console.log(data);
      this.refreshViewTable();
    });
  }

  refreshViewTable(audit: any = null) {
    this.count = this.audits.length;
    this.activePageDataChunk = this.audits.slice(0, this.pageSize);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
    this.changeDetectorRefs.detectChanges();
  }

  createAudit() {
    const dialogRef = this.dialog.open(CreateAuditComponent, {
      width: '500px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.audits.push(result);
        this.refreshViewTable(result);
        this.changeDetectorRefs.detectChanges();
      }
    });
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
          data => {
            this.audits = this.arrayRemove(this.audits, element);
            this.refreshViewTable(
              this.audits.length > 0 ? this.audits[0] : null
            );
          },
          error => {
            alert(error.message());
          }
        );
      }
    }
  }

  arrayRemove(arr, value) {
    return arr.filter(item => {
      return item !== value;
    });
  }

  getPaginatorData(event) {
    if (event.pageIndex === this.pageIndex + 1) {
      this.lowValue = this.lowValue + this.pageSize;
      this.highValue = this.highValue + this.pageSize;
    } else if (event.pageIndex === this.pageIndex - 1) {
      this.lowValue = this.lowValue - this.pageSize;
      this.highValue = this.highValue - this.pageSize;
    }
    this.pageIndex = event.pageIndex;

    const firstCut = event.pageIndex * event.pageSize;
    const secondCut = firstCut + event.pageSize;

    this.activePageDataChunk = this.audits.slice(firstCut, secondCut);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
  }

  valueSearch(value: string) {
    const filterVlaue = new Array<{ name: string; value: string }>();
    if (value.length > 0) {
      filterVlaue.push({ name: 'name', value: value });
    }
    this.refreshData(filterVlaue);
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
    this.subscription.unsubscribe();
  }
}
