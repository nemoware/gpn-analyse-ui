import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import {
  faClock,
  faFlagCheckered,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@root/node_modules/@angular/material';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import { HeaderModel } from '@app/models/header-model';
import { Document } from '@app/models/document.model';
import { AuditService } from '@app/features/audit/audit.service';
import { LinksDocumentModel } from '@app/models/links-document-model';
import { Helper } from '@app/features/audit/helper';
import { Tag } from '@app/models/legal-document';

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
  parseError?: string;
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

  faClock = faClock;
  faFlagCheckered = faFlagCheckered;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

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
      index: node.index
    };
  };

  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef
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
        const node = { name: t, children: [], childCount: 0 };

        for (const d of this.linkDoc.filter(x => x.documentType === t)) {
          i++;
          const nodeChild = {
            _id: d._id,
            name: d.filename,
            index: i,
            documentNumber: d.documentNumber,
            documentDate: d.documentDate
          };

          node.children.push(nodeChild);
          node.childCount = node.children.length;
        }

        this.TREE_DATA.push(node);
      }
      this.refreshTree();
    });
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
}
