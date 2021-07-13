import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  OnDestroy
} from '@angular/core';
import { ViewDetailDoc } from '@app/models/view.detail.doc';
import { DatePipe } from '@root/node_modules/@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Subject } from '@root/node_modules/rxjs';

const cols_by_type = {
  CONTRACT: [
    'org2',
    'subject',
    'people',
    'amount_brutto',
    'amount_netto',
    'insider_information',
    'warnings',
    'analyze_state'
  ],
  ANNEX: ['fileName', 'warnings', 'analyze_state'],
  BENEFICIARY_CHAIN: ['fileName', 'warnings', 'analyze_state']
};

@Component({
  selector: 'gpn-pre-audit-detail',
  templateUrl: './pre-audit-detail.component.html',
  styleUrls: ['./pre-audit-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class PreAuditDetailComponent implements OnInit, OnDestroy {
  @Input() documents: any;
  @Input() subsidiaryName: string;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  header: string;
  col: string[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  documentType: any;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  documentTypeName = null;
  focusedId: string;
  private destroyStream = new Subject<void>();

  constructor() {}

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
      this.dataSource.sort = this.sort;
      this.dataSource.data = docs;
      this.documentTypeName = docs[0].documentType;

      this.col = cols_by_type[this.documentTypeName].map(x => x);
      this.documentType = ViewDetailDoc.getTypeDoc(docs[0].documentType);
    } else {
      // no docs
      this.dataSource.data = [];
    }
  }

  openDocument(element) {
    window.open(
      window.location.origin + '/#/pre-audit/edit/' + element._id,
      '_blank'
    );
  }

  focusedDoc(id) {
    this.focusedId = id;
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
