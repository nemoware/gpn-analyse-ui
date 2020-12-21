import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Audit } from '@app/models/audit.model';
import { AuditService } from '@app/features/audit/audit.service';
import { LinksDocumentModel } from '@app/models/links-document-model';
import { Helper } from '@app/features/audit/helper';
const cols_by_type = {
  CONTRACT: ['date', 'number', 'value', 'org1', 'org2', 'contract_subject'],
  CHARTER: ['date', 'org'],
  PROTOCOL: ['date', 'org', 'org_level'],
  ANNEX: ['date', 'number', 'value', 'org1', 'org2', 'contract_subject']
};

@Component({
  selector: 'gpn-search-document',
  templateUrl: './search-document.component.html',
  styleUrls: ['./search-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AuditService]
})
export class SearchDocumentComponent implements OnInit, AfterViewInit {
  faTimes = faTimes;
  columns: string[];
  strDocument: string;

  documents: LinksDocumentModel[];
  documentsFiltered: LinksDocumentModel[];
  dataSource = new MatTableDataSource();
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    public dialogRef: MatDialogRef<SearchDocumentComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      auditId: string;
      type: string;
      Docs: string[];
    }
  ) {}

  ngOnInit() {}

  refreshViewTable(value?: string) {
    if (value)
      this.documentsFiltered = this.documents.filter(x => {
        const names = x.attributes.filter(a =>
          a.kind.toString().match(/(org-\d+(\.\d)*-name)/i)
        );
        const n = names.find(y =>
          y.value.toUpperCase().includes(value.toUpperCase())
        );
        return !!n;
      });
    else this.documentsFiltered = this.documents;
    this.dataSource = new MatTableDataSource(this.documentsFiltered);
    this.dataSource.sort = this.sort;
    this.changeDetectorRefs.detectChanges();
  }

  selectRow(row) {
    this.dialogRef.close(row);
  }

  closeForm() {
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {
    this.columns = cols_by_type[this.data.type].map(x => x);
    this.auditservice
      .getDocumentsByType(this.data.auditId, this.data.type)
      .subscribe(data => {
        this.documents = data;
        if (this.data.Docs && this.data.Docs.length > 0) {
          this.documents = this.documents.filter(
            x => !this.data.Docs.includes(x._id)
          );
        }
        this.documents.map(
          x => (x.attributes = Helper.json2array(x.attributes))
        );
        this.refreshViewTable();
      });
  }

  filterDoc(value) {
    this.refreshViewTable(value);
  }

  getAttrValue(attrName: string, doc, default_value = null) {
    if (doc && doc.attributes) {
      const atr = doc.attributes.find(x => x.key === attrName);
      if (atr) return atr.value;
    }
    return default_value;
  }
}
