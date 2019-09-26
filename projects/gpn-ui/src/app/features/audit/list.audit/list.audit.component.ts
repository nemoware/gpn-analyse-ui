import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { DomSanitizer } from '@root/node_modules/@angular/platform-browser';
import {
  MatDialog,
  MatIconRegistry,
  MatPaginator,
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { Audit } from '@app/models/audit.model';
import { AuditService } from '@app/features/audit/audit.service';
import { CreateAuditComponent } from '@app/features/audit/create-audit/create-audit.component';

@Component({
  selector: 'gpn-list.audit',
  templateUrl: './list.audit.component.html',
  styleUrls: ['./list.audit.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListAuditComponent implements OnInit, AfterViewInit {
  columns: string[] = [
    'name',
    'nameDepartment',
    'auditStart',
    'auditEnd',
    'documentCount',
    'endAudit',
    'statusAudit',
    'businessProcess',
    'comments'
  ];
  dataSource = new MatTableDataSource();
  activePageDataChunk = [];
  audits: Audit[];
  count = 0;
  pageIndex = 0;
  pageSize = 15;
  lowValue = 0;
  highValue = 15;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private auditservice: AuditService,
    public dialog: MatDialog
  ) {
    iconRegistry.addSvgIcon(
      'search.icon',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icon/search.svg')
    );
    iconRegistry.addSvgIcon(
      'comment.icon',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icon/comment.svg')
    );
  }
  ngOnInit() {}

  ngAfterViewInit(): void {
    /*
    const filterVlaue = new Array<{name: string, value: string}>();
    this.auditservice.getAudits(filterVlaue).subscribe(data => {
      this.audits = data;
      this.count = this.audits.length;
      this.activePageDataChunk = this.audits.slice(0, this.pageSize);
      this.dataSource = new MatTableDataSource(this.activePageDataChunk);
      this.dataSource.sort = this.sort;
    });*/
    this.audits = [
      {
        _id: '1',
        name: 'Аудит ДО от 21.06.2019',
        company: {
          name: 'ООО "Меретояхнефтегаз"'
        },
        ftpUrl: '----',
        auditStart: new Date(),
        auditEnd: new Date(),
        documentCount: 150,
        endAudit: 'Заключение аудита от 21.06.2019',
        statuses: [
          {
            date: new Date(),
            status: { _id: '1', name: 'В работе' },
            comment: '123321'
          }
        ],
        comments: [
          {
            date: new Date(),
            text: 'Комментарий',
            author: { _id: '1', login: 'login', name: 'Иванов И.И.' }
          }
        ]
      }
    ];
    this.count = this.audits.length;
    this.activePageDataChunk = this.audits.slice(0, this.pageSize);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
  }

  CreateAudit() {
    const dialogRef = this.dialog.open(CreateAuditComponent, {
      width: '400px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  OpenAudit(elem: Audit) {}

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
}
