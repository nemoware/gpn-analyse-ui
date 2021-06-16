import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@root/node_modules/@angular/router';
import { AuditService } from '@app/features/audit/audit.service';
import {
  MatDialog,
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@root/node_modules/@angular/material';
import { Tag } from '@app/models/legal-document';
import {
  faChevronDown,
  faChevronUp,
  faEye,
  faFile,
  faFolder,
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import { Document } from '@app/models/document.model';
import { Helper } from '@app/features/audit/helper';
import { Audit } from '@app/models/audit.model';

import { FileModel } from '@app/models/file-model';
import { DatePipe } from '@root/node_modules/@angular/common';
import { ConclusionModel } from '@app/models/conclusion-model';
// tslint:disable-next-line:import-blacklist
import { take, takeUntil } from '@root/node_modules/rxjs/internal/operators';
import { NgZone, ViewChild } from '@root/node_modules/@angular/core';
import { CdkTextareaAutosize } from '@root/node_modules/@angular/cdk/text-field';
import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';
import { ViolationModel } from '@app/models/violation-model';
import { Subject } from '@root/node_modules/rxjs';
import { SubsidiaryDetailComponent } from '@app/features/audit/audit-analyse-result/subsidiary-detail/subsidiary-detail.component';

interface Node {
  _id?: string;
  name: string;
  children?: any[];
  docs?: any[];
  details?: Tag;
  confidence?: number;
  kind?: string;
  childCount?: number;
  index?: number;
  documentDate?: Date;
  documentNumber?: string;
  error?: string;
  documentType?: string;
  attributes?: any;
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

const orderTypes = [
  'CHARTER',
  'CONTRACT',
  'PROTOCOL',
  'SUPPLEMENTARY_AGREEMENT',
  'ANNEX'
];

@Component({
  selector: 'gpn-audit-analyse-result',
  templateUrl: './audit-analyse-result.component.html',
  styleUrls: ['./audit-analyse-result.component.scss'],
  providers: [AuditService, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditAnalyseResultComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faEye = faEye;
  faFolder = faFolder;
  faFolderOpen = faFolderOpen;
  faFile = faFile;
  IdAudit;
  docs: Document[];
  TREE_DATA: Node[] = [];
  audit: Audit;
  tableSource;
  dataSource;
  selectedPage = -1;
  maxPageIndex = -1;
  errorCount = 0;
  documentCount = 0;
  checkCount = 0;
  files: FileModel[];
  loading = false;
  mouseOverID = '';
  conclusion: ConclusionModel;
  loadingConclusion = true;
  changed = false;
  selectedRows: ViolationModel[];
  private destroyStream = new Subject<void>();
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      childCount: node.childCount,
      docs: node.docs
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable
  );

  constructor(
    private activatedRoute: ActivatedRoute,
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    private router: Router,
    public datepipe: DatePipe,
    private _ngZone: NgZone,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog
  ) {
    this.IdAudit = this.activatedRoute.snapshot.paramMap.get('id');
  }
  ngOnInit() {}

  ngAfterViewInit(): void {
    this.auditservice
      .getAudits([{ name: 'id', value: this.IdAudit }])
      .pipe(takeUntil(this.destroyStream))
      .subscribe(data => {
        this.audit = data[0];
        this.maxPageIndex = this.audit.typeViewResult;
        if (this.maxPageIndex === 4) {
          this.selectedPage = 3;
          this.selectedRows = this.audit.selectedRows;
        } else {
          this.selectedPage = this.audit.typeViewResult;
        }
      });
  }

  fillNodes(files: FileModel, parentNode: Node = null) {
    const node = {
      name: files.name,
      children: [],
      childCount: 0,
      error: files.error
    };

    if (files.error != null && files.files == null) this.errorCount++;
    if (files.files == null) this.documentCount++;

    if (parentNode != null) parentNode.children.push(node);
    else {
      this.TREE_DATA.push(node);
    }
    if (files.files) {
      node.childCount = files.files.length;
      for (const n of files.files) {
        this.fillNodes(n, node);
      }
    }
  }

  refreshData() {
    this.loading = true;
    this.errorCount = 0;
    this.documentCount = 0;
    this.checkCount = 0;
    this.TREE_DATA = [];

    if (this.selectedPage === 0) {
      this.auditservice
        .getFiles(this.IdAudit)
        .pipe(takeUntil(this.destroyStream))
        .subscribe(data => {
          this.files = data;
          for (const n of this.files) this.fillNodes(n);
          this.refreshTree();
        });
    } else if (this.selectedPage <= 1) {
      this.auditservice
        .getDouments(this.IdAudit, false)
        .pipe(takeUntil(this.destroyStream))
        .subscribe(data => {
          this.docs = data;
          if (this.audit.typeViewResult === 2) {
            this.docs = this.docs.filter(
              x => x.analysis != null || x.user != null
            );
          }
          const uniqueType =
            this.selectedPage === 2
              ? orderTypes
              : this.docs.reduce(function(a, d) {
                  if (a.indexOf(d.documentType) === -1) {
                    a.push(d.documentType);
                  }
                  return a;
                }, []);
          for (const t of uniqueType) {
            let i = 0;
            const node = { name: t, children: [], childCount: 0 };
            const docs = { docs: [] };
            for (const d of this.docs.filter(x => x.documentType === t)) {
              i++;

              const addon = {
                //TODO: why ?? we need to convert doc to this wtf?
                name: d.filename,
                index: i,
                children: [],
                childCount: 0,
                parseError: d.parseError,
                documentType: t,
                attributes: null,
                starred: d.starred
              };

              const nodeChild = Object.assign({}, d, addon);

              if (this.selectedPage === 2) {
                nodeChild.attributes =
                  d.user != null
                    ? d.user.attributes
                    : d.analysis && d.analysis.attributes
                    ? d.analysis.attributes
                    : [];
                docs.docs.push(nodeChild);
              } else node.children.push(nodeChild);
            }

            if (this.selectedPage === 2) {
              node.children.push(docs);
              node.childCount = docs.docs.length;
            } else node.childCount = node.children.length;

            if (this.selectedPage !== 2 || docs.docs.length > 0)
              this.TREE_DATA.push(node);
          }
          this.refreshTree();
        });
    } else if (this.selectedPage === 2) {
      this.spinner.show();
      this.auditservice
        .getListNotUsedDocuments(this.IdAudit)
        .pipe(takeUntil(this.destroyStream))
        .subscribe(data => {
          for (let val in data) {
            if (data[val].count === 0) continue;
            this.TREE_DATA.push({
              name: data[val].type,
              childCount: data[val].count,
              children: [
                {
                  documentType: data[val].type,
                  docs: [
                    {
                      auditid: this.IdAudit,
                      documentType: data[val].type
                    }
                  ]
                }
              ],
              docs: [
                {
                  auditid: this.IdAudit,
                  documentType: data[val].type
                }
              ]
            });
          }

          this.changeDetectorRefs.detectChanges();
          this.spinner.hide();
          this.refreshTree();
        });
    } else if (this.selectedPage === 4) {
      this.spinner.show();
      this.auditservice
        .getConclusion(this.IdAudit)
        .pipe(takeUntil(this.destroyStream))
        .subscribe(
          data => {
            this.conclusion = data;
            this.loadingConclusion = false;
            this.spinner.hide();
          },
          error => {
            this.spinner.hide();
            window.alert(error);
          }
        );
    }
    this.loading = false;
  }

  refreshTree() {
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataSource.data = this.TREE_DATA;
    this.checkCount = this.documentCount - this.errorCount;
    this.changeDetectorRefs.detectChanges();
  }

  openEditor(node) {
    this.router.navigate(['audit/view/', node._id]);
  }

  openError(node) {
    if (node.parseError) alert(node.parseError);
  }

  changePage(e) {
    this.selectedPage = e.index;
    this.refreshData();
  }

  mouseOver(node) {
    this.mouseOverID = node._id;
  }

  approveAudit() {
    if (
      confirm(
        'Вы действительно хотите подтвердить проверку? После подтверждения режим обучения и корректировки атрибутов будет недоступен!'
      )
    ) {
      const approve = this.auditservice
        .postApprove(this.IdAudit)
        .subscribe(() => {
          this.audit.status = 'Approved';
          approve.unsubscribe();
          this.changeDetectorRefs.detectChanges();
        });
    }
  }

  getAttrValue(attrName: string, doc, default_value = null) {
    if (!doc.analysis || !doc.analysis.attributes) return default_value;
    if (doc.user && doc.user.attributes) {
      if (doc.user.attributes[attrName])
        return doc.user.attributes[attrName].value;
    } else if (doc.analysis.attributes[attrName]) {
      return doc.analysis.attributes[attrName].value;
    }
  }

  exportDocument() {
    const conclusion = this.auditservice
      .exportConclusion(this.IdAudit, this.selectedRows)
      .subscribe(data => {
        const a = document.createElement('a');
        const blob = this.base64toBlob(atob(data.base64Document));
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = `Заключение по проведенной проверке ${
          data.subsidiary
        } за период от ${this.datepipe.transform(
          data.auditStart,
          'dd-MM-yyyy'
        )} по ${this.datepipe.transform(data.auditEnd, 'dd-MM-yyyy')}.docx`;
        a.click();
        window.URL.revokeObjectURL(url);
        conclusion.unsubscribe();
      });
  }

  base64toBlob(byteString) {
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: 'octet/stream' });
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  saveConclusion() {
    this.spinner.show();
    this.auditservice
      .postConclusion(this.IdAudit, this.conclusion)
      .pipe(takeUntil(this.destroyStream))
      .subscribe(() => {
        this.changed = false;
        this.spinner.hide();
      });
  }

  setChanged() {
    this.changed = true;
  }

  public goToAttribute(id) {
    const element = document.getElementById(id);
    if (element != null)
      element.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
    return false;
  }

  onUpdateViolations(selectedRows) {
    this.changed = true;
    this.selectedRows = selectedRows;
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }

  openDialog() {
    const dialogRef = this.dialog.open(SubsidiaryDetailComponent, {
      data: {
        audit: this.audit
      }
    });

    dialogRef.afterClosed().subscribe(() => {});
  }
}
