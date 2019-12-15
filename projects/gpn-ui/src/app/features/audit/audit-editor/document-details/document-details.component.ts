import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import {
  MatDialog,
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@root/node_modules/@angular/material';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import { Document } from '@app/models/document.model';
import { AuditService } from '@app/features/audit/audit.service';
import { LinksDocumentModel } from '@app/models/links-document-model';
import { Tag } from '@app/models/legal-document';
import {
  faClock,
  faFlagCheckered,
  faChevronDown,
  faChevronUp,
  faSearch,
  faEye,
  faTimes,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { SearchDocumentComponent } from '@app/features/audit/audit-editor/search-document/search-document.component';
import { LinksDoc } from '@app/models/links-doc';

interface Node {
  _id?: string;
  name: string;
  children?: Node[];
  details?: Tag;
  confidence?: number;
  kind?: string;
  childCount?: number;
  index?: number;
  documentDate?: Date;
  documentNumber?: string;
  type: string;
  linkId?: string;
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'gpn-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentDetailsComponent implements OnInit, AfterViewInit {
  @Input() document: Document;
  @Input() editable: boolean;

  faTimes = faTimes;
  faPlus = faPlus;
  focusedId = '';

  TREE_DATA: Node[] = [];
  treeControl;
  treeFlattener;
  dataSource;
  linkDoc: LinksDocumentModel[];
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      index: node.index,
      type: node.type,
      _id: node._id,
      linkId: node.linkId,
      documentNumber: node.documentNumber,
      documentDate: node.documentDate
    };
  };

  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    public dialog: MatDialog
  ) {}

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

  refreshData() {
    this.TREE_DATA = [];
    this.auditservice.getLinkDocuments(this.document._id).subscribe(res => {
      this.linkDoc = res;
      const uniqueType = this.linkDoc.reduce(function(a, d) {
        if (a.indexOf(d.documentType) === -1) {
          a.push(d.documentType);
        }
        return a;
      }, []);

      for (const t of uniqueType) {
        let i = 0;
        const node = { name: t, children: [], childCount: 0, type: t };

        for (const d of this.linkDoc.filter(x => x.documentType === t)) {
          i++;
          const nodeChild = {
            _id: d._id,
            name: d.filename,
            index: i,
            documentNumber: d.documentNumber,
            documentDate: d.documentDate,
            type: t,
            linkId: d.linkId
          };

          node.children.push(nodeChild);
          node.childCount = node.children.length;
        }

        this.TREE_DATA.push(node);
      }

      for (const type of LinksDoc.getLinksType(this.document.documentType)
        .links) {
        this.createEmpty(type, uniqueType);
      }

      this.refreshTree();
    });
  }

  createEmpty(type: string, uniqueType: string[]) {
    if (!uniqueType.includes(type)) {
      const node = { name: type, children: [], childCount: 0, type: type };
      const nodeChild = {
        _id: -1,
        name: 'Не определен',
        index: -1,
        documentNumber: null,
        documentDate: null,
        type: type
      };
      node.children.push(nodeChild);
      this.TREE_DATA.push(node);
    }
  }

  refreshTree() {
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataSource.data = this.TREE_DATA;
    this.treeControl.expandAll();
    this.changeDetectorRefs.detectChanges();
  }

  ngAfterViewInit(): void {
    this.refreshData();
  }

  addDocument(node) {
    const docs = Array.from(
      this.TREE_DATA.find(x => x.type === node.type).children.filter(
        x => x.type === node.type
      ),
      x => x._id
    );
    const dialogRef = this.dialog.open(SearchDocumentComponent, {
      width: node.type === 'CONTRACT' ? '90%' : '50%',
      height: '90%',
      data: {
        auditId: this.document.auditId,
        type: node.type,
        Docs: docs
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.auditservice
          .postLinks({ fromId: this.document._id, toId: result._id })
          .subscribe(data => {
            this.refreshData();
          });
      }
    });
  }

  deleteDocument(node) {
    if (
      confirm('Вы действительно изъять данный документ из списка связанных?')
    ) {
      this.auditservice.deleteLinks(node.linkId).subscribe(data => {
        this.refreshData();
      });
    }
  }

  openDocument(node) {
    if (node.index === 0) return;
    window.open(window.location.origin + '/#/audit/view/' + node._id, '_blank');
  }

  focusedDoc(id) {
    this.focusedId = id;
  }
}
