import { AuditDataSource } from '@app/features/audit/audit-data-source';
import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { DatePipe } from '@root/node_modules/@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@root/node_modules/@angular/animations';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { AuditService } from '@app/features/audit/audit.service';
import { Subject, merge } from '@root/node_modules/rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Document } from '@app/models/document.model';
import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';

const cols_by_type = {
  CONTRACT: [
    'shevron',
    'starred',
    'date',
    'number',
    'amount_with_vat',
    'value',
    'org1',
    'org2',
    'contract_subject',
    'warnings',
    'state',
    'charterAndProtocol'
  ],
  CHARTER: ['shevron', 'starred', 'date', 'org', 'warnings', 'state'],
  PROTOCOL: [
    'shevron',
    'starred',
    'date',
    'org',
    'org_level',
    'warnings',
    'state'
  ],
  ANNEX: [
    'shevron',
    'starred',
    'date',
    'number',
    'value',
    'org1',
    'org2',
    'contract_subject',
    'warnings',
    'state',
    'charterAndProtocol'
  ],
  SUPPLEMENTARY_AGREEMENT: [
    'shevron',
    'starred',
    'date',
    'number',
    'value',
    'org1',
    'org2',
    'contract_subject',
    'warnings',
    'state',
    'charterAndProtocol'
  ]
};

@Component({
  selector: 'gpn-document-table-detail',
  templateUrl: './document-table-detail.component.html',
  styleUrls: ['./document-table-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('100ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      )
    ])
  ]
})
export class DocumentTableDetailComponent implements OnInit {
  @Input() auditId: string;
  @Input() documentId: string;
  @Input() documentType: string;
  @Input() isNotUsedDoc: boolean = false;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  defPageSize = 15;
  header: string;
  col: string[] = [];
  dataSource2: MatTableDataSource<any> = new MatTableDataSource([]);
  dataSource: AuditDataSource;
  expandedElementId = '';
  arrOfexpandedElementId = [];
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  documentTypeName = null;
  focusedId: string;
  _filterValue: [];
  totalCount: number;
  private destroyStream = new Subject<void>();

  constructor(
    private auditService: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    private spinner: NgxSpinnerService
  ) {}

  isExpansionDetailRow = () => true;

  hasWarnings(document): boolean {
    return (
      document.analysis &&
      document.analysis.warnings &&
      document.analysis.warnings.length > 0
    );
  }

  ngOnInit() {
    this.dataSource = new AuditDataSource(this.auditService);
    if (this.isNotUsedDoc) {
      this.dataSource.loadNotUsedDocuments(
        this.auditId,
        this.documentType,
        15,
        0,
        'date',
        'desc'
      );
    } else {
      this.dataSource.loadContract(
        this.auditId,
        this.documentId,
        this.documentType,
        15,
        0,
        'date',
        'desc'
      );
    }

    this.dataSource
      .getLoadingState()
      .pipe(takeUntil(this.destroyStream))
      .subscribe(data => {
        if (data) {
          this.spinner.show();
        } else {
          this.spinner.hide();
          this.totalCount = this.dataSource.totalCount;
          this.col = cols_by_type[this.dataSource.documentType].map(x => x);
        }
      });
  }

  ngAfterViewInit() {
      this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
      this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
      merge(this.sort.sortChange, this.paginator.page)
        .pipe(tap(() => this.loadChartersPage()))
        .subscribe();
    
  }

  loadChartersPage() {
    if (this.isNotUsedDoc) {
      this.dataSource.loadNotUsedDocuments(
        this.auditId,
        this.documentType,
        this.paginator.pageSize,
        this.paginator.pageIndex,
        this.sort.active,
        this.sort.direction
      );
    } else {
      this.dataSource.loadContract(
        this.auditId,
        this.documentId,
        this.documentType,
        this.paginator.pageSize,
        this.paginator.pageIndex,
        this.sort.active,
        this.sort.direction
      );
    }
  }

  getAttrValue(attrName: string, doc, default_value = null) {
    if (doc && doc.attributes) {
      if (attrName === 'contract_price_amount') {
        const atr = doc.attributes.find(
          x => x.key === 'subject/price/amount' || x.key === 'price/amount'
        );
        if (atr) return atr.value;
      } else if (attrName === 'contract_price_currency') {
        const atr = doc.attributes.find(
          x => x.key === 'subject/price/currency' || x.key === 'price/currency'
        );
        if (atr) return atr.value;
      } else {
        const atr = doc.attributes.find(x => x.key === attrName);
        if (atr) return atr.value;
      }
    }
    return default_value;
  }

  openDocument(element) {
    window.open(
      window.location.origin + '/#/audit/edit/' + element._id,
      '_blank'
    );
  }

  openCharterOrProtocol(element) {
    if (element) {
      window.open(
        window.location.origin + '/#/audit/edit/' + element.id,
        '_blank'
      );
    }
  }

  selectedRow(value, event) {
    if (value._id !== this.expandedElementId) {
      this.expandedElementId = value._id;
    } else {
      this.expandedElementId = '-1';
    }

    if (!this.arrOfexpandedElementId.includes(value._id)) {
      this.arrOfexpandedElementId.push(value._id);
    } else {
      this.arrOfexpandedElementId.splice(
        this.arrOfexpandedElementId.indexOf(value._id),
        1
      );
    }
    event.stopPropagation();
  }

  starDoc(a, event) {
    event.stopPropagation();
    if (a.starred) {
      this.auditService
        .deleteStart(a._id)
        .pipe(takeUntil(this.destroyStream))
        .subscribe(() => {
          a.starred = false;
        });
    } else {
      this.auditService
        .postStar(a._id)
        .pipe(takeUntil(this.destroyStream))
        .subscribe(() => {
          a.starred = true;
        });
    }
    this.changeDetectorRefs.detectChanges();
  }

  focusedDoc(id) {
    this.focusedId = id;
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
