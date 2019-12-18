import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { Document } from '@app/models/document.model';
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

const cols_by_type = {
  CONTRACT: [
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
  CHARTER: ['star', 'date', 'shevron', 'org', 'warnings', 'analyze_state'],
  PROTOCOL: ['star', 'date', 'org', 'org_level', 'warnings', 'analyze_state']
};

const column_to_sorting_mapping = {
  date: 'date',
  subject: 'subject',
  number: 'number',
  value: 'sign_value_currency/value',
  org1: 'org-1-name',
  org2: 'org-2-name',
  org: 'org-1-name'
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
export class DocumentDetailComponent implements OnInit {
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

  constructor(
    private translate: TranslateService,
    public datepipe: DatePipe,
    private router: Router,
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {}

  isExpansionDetailRow = (i: number, row: Object) => true;

  _sortingDataAccessor: (data, sortHeaderId: string) => string | number = (
    data,
    sortHeaderId: string
  ): string | number => {
    if (sortHeaderId in column_to_sorting_mapping) {
      const attr = column_to_sorting_mapping[sortHeaderId];
      const res = this.getAttrValue(attr, data);
      return res;
    }
    if ('warnings' == sortHeaderId) {
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
      const atr = doc.attributes.find(x => x.key === attrName);
      if (atr) return atr.value;
    }
    return default_value;
  }

  getDocStateClass(doc) {
    return 'state state-' + doc.state;
  }

  openDocument(element) {
    window.open(
      window.location.origin + '/#/audit/view/' + element._id,
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
      this.auditservice.deleteStart(a._id).subscribe(data => {
        a.starred = false;
      });
    } else {
      this.auditservice.postStar(a._id).subscribe(data => {
        a.starred = true;
      });
    }
    this.changeDetectorRefs.detectChanges();
  }

  focusedDoc(id) {
    this.focusedId = id;
  }
}
