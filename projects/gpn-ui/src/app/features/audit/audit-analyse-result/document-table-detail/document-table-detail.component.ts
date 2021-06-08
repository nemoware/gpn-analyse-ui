import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { ViewDetailDoc } from '@app/models/view.detail.doc';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { DatePipe } from '@root/node_modules/@angular/common';
import { Router } from '@root/node_modules/@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@root/node_modules/@angular/animations';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { AuditService } from '@app/features/audit/audit.service';
import { Subject } from '@root/node_modules/rxjs';
import { takeUntil } from 'rxjs/operators';
import { Document } from '@app/models/document.model';

const cols_by_type = {
  CONTRACT: [
    'shevron',
    'star',
    'date',
    'number',
    'amount_with_vat',
    'value',
    'org1',
    'org2',
    'contract_subject',
    'spacer',
    'warnings',
    'analyze_state'
  ],
  CHARTER: ['star', 'date', 'shevron', 'org', 'warnings', 'analyze_state'],
  PROTOCOL: ['star', 'date', 'org', 'org_level', 'warnings', 'analyze_state'],
  ANNEX: [
    'star',
    'date',
    'number',
    'value',
    'org1',
    'org2',
    'contract_subject',
    'spacer',
    'warnings',
    'analyze_state'
  ],
  SUPPLEMENTARY_AGREEMENT: [
    'star',
    'date',
    'number',
    'value',
    'org1',
    'org2',
    'contract_subject',
    'spacer',
    'warnings',
    'analyze_state'
  ]
};

const column_to_sorting_mapping = {
  date: 'date',
  contract_subject: 'subject',
  number: 'number',
  value: 'contract_price_amount',
  org1: 'org-1-name',
  org2: 'org-2-name',
  org: 'org-1-name',
  org_level: 'org_structural_level'
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
  @Input() documents: Document[];
  @Input() subsidiaryName: string;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  header: string;
  col: string[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  documentType: any;
  expandedElementId = '';
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  documentTypeName = null;
  focusedId: string;
  private destroyStream = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private router: Router,
    private auditService: AuditService,
    private changeDetectorRefs: ChangeDetectorRef
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
    const docs: Document[] = this.documents;
    // docs.map(i => {
    //   i.analysis.attributes_tree.contract.date.

    // });
    console.log(this.documents);

    this.documentTypeName = null;
    if (docs && docs.length > 0) {
      this.dataSource.sort = this.sort;
      this.dataSource.data = docs;
      this.col = cols_by_type[docs[0].parse.documentType].map(x => x);
    } else {
      this.dataSource.data = [];
    }
  }

  _isAllOrgsSame(docs, keyname: string): boolean {
    let res = true;
    docs.forEach(doc => {
      if (this.subsidiaryName !== this.getAttrValue(keyname, doc)) {
        res = false;
        return;
      }
    });
    return res;
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

  selectedRow(value, event) {
    this.expandedElementId =
      value._id !== this.expandedElementId ? value._id : '-1';
    console.log('this.expandedElementId');
    console.log(this.expandedElementId);

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
