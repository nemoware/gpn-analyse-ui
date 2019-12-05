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

@Component({
  selector: 'gpn-search-document',
  templateUrl: './search-document.component.html',
  styleUrls: ['./search-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AuditService]
})
export class SearchDocumentComponent implements OnInit, AfterViewInit {
  faTimes = faTimes;
  columns: string[] = ['filename', 'documentNumber', 'documentDate'];
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

  refreshViewTable() {
    if (this.strDocument && this.strDocument.length > 0)
      this.documentsFiltered = this.documents.filter(x =>
        x.filename.toUpperCase().includes(this.strDocument.toUpperCase())
      );
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
    this.auditservice
      .getDocumentsByType(this.data.auditId, this.data.type)
      .subscribe(data => {
        this.documents = data;
        if (this.data.Docs && this.data.Docs.length > 0) {
          this.documents = this.documents.filter(
            x => !this.data.Docs.includes(x._id)
          );
        }
        this.refreshViewTable();
      });
  }

  filterDoc() {
    this.refreshViewTable();
  }
}
