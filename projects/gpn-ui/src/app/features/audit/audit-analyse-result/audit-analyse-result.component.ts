import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@root/node_modules/@angular/router';
import { AuditService } from '@app/features/audit/audit.service';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@root/node_modules/@angular/material';
import { Tag } from '@app/models/legal-document';
import {
  faChevronDown,
  faChevronUp,
  faEye,
  faClock,
  faFlagCheckered,
  faExclamationTriangle,
  faFolder,
  faFolderOpen,
  faFile
} from '@fortawesome/free-solid-svg-icons';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import { Document } from '@app/models/document.model';
import { Helper } from '@app/features/audit/helper';
import { Audit } from '@app/models/audit.model';

import { FileModel } from '@app/models/file-model';
import { DocumentTypeModel } from '@app/models/document-type-model';

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

@Component({
  selector: 'gpn-audit-analyse-result',
  templateUrl: './audit-analyse-result.component.html',
  styleUrls: ['./audit-analyse-result.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditAnalyseResultComponent implements OnInit, AfterViewInit {
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faEye = faEye;
  faClock = faClock;
  faExclamationTriangle = faExclamationTriangle;
  faFlagCheckered = faFlagCheckered;
  faFolder = faFolder;
  faFolderOpen = faFolderOpen;
  faFile = faFile;
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
  documentType: DocumentTypeModel[];
  mouseOverID = '';
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      kind: node.kind,
      childCount: node.childCount,
      level: level,
      index: node.index,
      documentDate: node.documentDate,
      documentNumber: node.documentNumber,
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
    private router: Router
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
    this.auditservice
      .getAudits([{ name: 'id', value: this.IdAudit }])
      .subscribe(data => {
        this.audit = data[0];
        this.maxPageIndex = this.audit.typeViewResult;
        this.selectedPage = this.audit.typeViewResult;
        this.auditservice.getDoumentType().subscribe(res => {
          this.documentType = res;
        });
        this.refreshData();
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
      this.auditservice.getFiles(this.IdAudit).subscribe(data => {
        this.files = data;
        for (const n of this.files) this.fillNodes(n);
        this.refreshTree();
      });
    } else {
      this.auditservice.getDouments(this.IdAudit, false).subscribe(data => {
        this.docs = data;

        if (this.audit.typeViewResult === 2) {
          this.docs = this.docs.filter(
            x => x.analysis != null || x.user != null
          );
        }

        const uniqueType = this.docs.reduce(function(a, d) {
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

            const nodeChild = {
              _id: d._id,
              name: d.filename,
              index: i,
              documentNumber: d.documentNumber,
              documentDate: d.documentDate,
              children: [],
              childCount: 0,
              parseError: d.parseError,
              documentType: t,
              attributes: null
            };

            if (this.selectedPage === 2) {
              nodeChild.attributes =
                d.user != null
                  ? Helper.json2array(d.user.attributes)
                  : Helper.json2array(d.analysis.attributes);
              docs.docs.push(nodeChild);
            } else node.children.push(nodeChild);
          }

          if (this.selectedPage === 2) {
            node.children.push(docs);
            node.childCount = docs.docs.length;
          } else node.childCount = node.children.length;
          this.TREE_DATA.push(node);
        }
        this.refreshTree();
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
    if (this.selectedPage === 0) this.treeControl.expandAll();
    else
      for (const n of this.treeControl.dataNodes) {
        if (n.level === 0) this.treeControl.expand(n);
      }
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
}
