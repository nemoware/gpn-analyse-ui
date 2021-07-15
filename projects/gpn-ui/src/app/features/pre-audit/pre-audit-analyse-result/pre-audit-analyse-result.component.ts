import { AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
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
  faEye
} from '@fortawesome/free-solid-svg-icons';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import { Document } from '@app/models/document.model';
import { Audit } from '@app/models/audit.model';

import { FileModel } from '@app/models/file-model';
import { DatePipe } from '@root/node_modules/@angular/common';
// tslint:disable-next-line:import-blacklist
import { take, takeUntil } from '@root/node_modules/rxjs/internal/operators';
import { NgZone, ViewChild } from '@root/node_modules/@angular/core';
import { CdkTextareaAutosize } from '@root/node_modules/@angular/cdk/text-field';
import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';
import { Subject } from '@root/node_modules/rxjs';

interface Node {
  _id?: string;
  name: string;
  children?: any[];
  docs?: [];
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
  'ANNEX',
  'BENEFICIARY_CHAIN'
];
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PreAuditService } from '@app/features/pre-audit/pre-audit.service';

@Component({
  selector: 'gpn-pre-audit-analyse-result',
  templateUrl: './pre-audit-analyse-result.component.html',
  styleUrls: ['./pre-audit-analyse-result.component.scss'],
  providers: [AuditService, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreAuditAnalyseResultComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faEye = faEye;
  IdAudit;
  docs: Document[];
  TREE_DATA: Node[] = [];
  audit: Audit;
  treeControl;
  treeFlattener;
  dataSource;
  selectedPage = -1;
  maxPageIndex = -1;
  errorCount = 0;
  documentCount = 0;
  checkCount = 0;
  files: FileModel[];
  loading = false;
  mouseOverID = '';
  private destroyStream = new Subject<void>();
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      kind: node.kind,
      childCount: node.childCount,
      level: level,
      index: node.index,
      documentDate: this.getAttrValue('date', node),
      documentNumber: this.getAttrValue('number', node),
      documentType: node.documentType,
      _id: node._id,
      error: node.error,
      attributes: node.attributes,
      docs: node.docs
    };
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    private router: Router,
    private _ngZone: NgZone,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private preAuditService: PreAuditService
  ) {
    this.IdAudit = this.activatedRoute.snapshot.paramMap.get('id');
  }
  ngOnInit() {
    this.treeFlattener = new MatTreeFlattener(
      this._transformer,
      node => node.level,
      node => node.expandable,
      node => node.children
    );
    this.treeControl = new FlatTreeControl<ExampleFlatNode>(
      node => node.level,
      node => node.expandable
    );
  }

  ngAfterViewInit(): void {
    this.preAuditService
      .getAudits([{ name: 'id', value: this.IdAudit }])
      .pipe(takeUntil(this.destroyStream))
      .subscribe(data => {
        this.audit = data;
        this.maxPageIndex = this.audit.typeViewResult;
        this.selectedPage = this.audit.typeViewResult;
        if (this.selectedPage === 0) this.refreshData();
        this.changeDetectorRefs.detectChanges();
      });
  }

  refreshData() {
    this.loading = true;
    this.errorCount = 0;
    this.documentCount = 0;
    this.checkCount = 0;
    this.TREE_DATA = [];
    if (this.selectedPage <= 1) {
      this.spinner.show();
      this.preAuditService
        .getDocuments(this.IdAudit)
        .pipe(takeUntil(this.destroyStream))
        .subscribe(data => {
          this.docs = data;
          if (this.audit.typeViewResult === 1) {
            this.docs = this.docs.filter(
              x => x.analysis != null || x.user != null
            );
          }
          const uniqueType =
            this.selectedPage === 1
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
                attributes: null
              };

              const nodeChild = Object.assign({}, d, addon);

              if (this.selectedPage === 1) {
                docs.docs.push(nodeChild);
              } else node.children.push(nodeChild);
            }

            if (this.selectedPage === 1) {
              node.children.push(docs);
              node.childCount = docs.docs.length;
            } else node.childCount = node.children.length;

            if (this.selectedPage !== 1 || docs.docs.length > 0)
              this.TREE_DATA.push(node);
          }
          this.refreshTree();
          this.spinner.hide();
        });
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
    this.router.navigate(['pre-audit/view/', node._id]);
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

  getAttrValue(attrName: string, doc, default_value = null) {
    if (!doc.analysis || !doc.analysis.attributes) return default_value;
    if (doc.user && doc.user.attributes) {
      if (doc.user.attributes[attrName])
        return doc.user.attributes[attrName].value;
    } else if (doc.analysis.attributes[attrName]) {
      return doc.analysis.attributes[attrName].value;
    }
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
