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

const cols_by_type = {
  CONTRACT: [
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
  selector: 'gpn-document-detail',
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.scss'],
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
export class DocumentDetailComponent implements OnInit, OnDestroy {
  @Input() documents: any;
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

  _sortingDataAccessor: (data, sortHeaderId: string) => string | number = (
    data,
    sortHeaderId: string
  ): string | number => {
    if (sortHeaderId === 'analyze_state') {
      if (
        data.state === 0 ||
        data.state === 1 ||
        data.state === 5 ||
        data.state === null
      )
        return 'Загружен, ожидает анализа' + data.analysis.analyze_timestamp;
      if (data.state === 10)
        return 'Анализируется' + data.analysis.analyze_timestamp;
      if (data.state === 11)
        return 'Ошибка при анализе' + data.analysis.analyze_timestamp;
      if (data.state === 12)
        return (
          'Документ не попадает под параметры Проверки' +
          data.analysis.analyze_timestamp
        );
      if (data.state === 15)
        return 'Анализ завершен' + data.analysis.analyze_timestamp;
      return ' ';
    }
    if (sortHeaderId in column_to_sorting_mapping) {
      const attr = column_to_sorting_mapping[sortHeaderId];
      if (sortHeaderId === 'contract_subject' || sortHeaderId === 'org_level')
        return this.translate.instant(this.getAttrValue(attr, data) || ' ');
      return this.getAttrValue(attr, data);
    }
    if ('warnings' === sortHeaderId) {
      if (data.analysis && data.analysis.warnings)
        return data.analysis.warnings.length;
      else return 0;
    }
    return -1;
  };

  hasWarnings(document): boolean {
    return (
      document.analysis &&
      document.analysis.warnings &&
      document.analysis.warnings.length > 0
    );
  }

  ngOnInit() {
    const docs = this.documents.docs; // shortcut
    this.documentTypeName = null;
    if (docs && docs.length > 0) {
      this.dataSource.sortingDataAccessor = this._sortingDataAccessor;
      this.dataSource.sort = this.sort;
      this.dataSource.data = docs;
      this.documentTypeName = docs[0].documentType;

      this.col = cols_by_type[this.documentTypeName].map(x => x);
      this.documentType = ViewDetailDoc.getTypeDoc(docs[0].documentType);

      if (this._isAllOrgsSame(docs, 'org-1-name')) {
        let index = this.col.indexOf('org1', 0);
        if (index > -1) {
          this.col.splice(index, 1);
        }

        index = this.col.indexOf('org', 0);
        if (index > -1) {
          this.col.splice(index, 1);
        }
      }
    } else {
      // no docs
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
