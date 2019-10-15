import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@root/node_modules/@angular/material';
import { AuditService } from '@app/features/audit/audit.service';
import { DocumentParser } from '@app/models/document.model';
import { FlatTreeControl } from '@angular/cdk/tree';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import {
  faSearch,
  faChevronDown,
  faChevronUp,
  faTimes,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { Tag } from '@app/models/legal-document';
import { DocumentAnalyze } from '@app/models/document-analyze';

interface Node {
  name: string;
  children?: Node[];
  details?: Tag;
  confidence?: number;
  kind?: string;
  childCount?: number;
  index?: number;
  documentDate?: Date;
  documentNumber?: string;
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'gpn-audit-result',
  templateUrl: './audit-parser-result.component.html',
  styleUrls: ['./audit-parser-result.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditResultComponent implements OnInit, AfterViewInit {
  faSearch = faSearch;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faTimes = faTimes;
  faClock = faClock;
  docs: DocumentParser[];
  docsA: DocumentAnalyze;
  TREE_DATA: Node[] = [];

  treeControl;
  treeFlattener;
  dataSource;
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
      documentNumber: node.documentNumber
    };
  };

  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AuditResultComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      auditId: string;
      subsidiaryName: string;
      auditStart: Date;
      auditEnd: Date;
      status: string;
    }
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

  ngAfterViewInit(): void {
    this.refreshData();
  }

  json2array(json) {
    const result = [];
    const keys = Object.keys(json);
    keys.forEach(key => {
      json[key].kind = key;
      result.push(json[key]);
    });
    return result;
  }

  refreshDataA() {
    this.auditservice.getDoumentsAnalyze().subscribe(data => {
      const uniqueType = ['CONTRACT'];
      this.docsA = data;
      for (const t of uniqueType) {
        const node = { name: t, children: [], childCount: 0 };
        const nodeChild = { name: this.docsA._id, children: [], childCount: 0 };
        const atr = this.json2array(data.attributes);

        for (const _atr of atr) {
          nodeChild.children.push({
            name: _atr.display_value,
            confidence: _atr.confidence,
            kind: _atr.kind
          });
          nodeChild.childCount++;
        }

        node.children.push(nodeChild);
        node.childCount++;
        this.TREE_DATA.push(node);
      }
      this.dataSource = new MatTreeFlatDataSource(
        this.treeControl,
        this.treeFlattener
      );
      this.dataSource.data = this.TREE_DATA;
      this.changeDetectorRefs.detectChanges();
      console.log(this.TREE_DATA);
    });
  }

  refreshData() {
    this.auditservice.getDoumentsParser(this.data.auditId).subscribe(data => {
      const uniqueType = data.reduce(function(a, d) {
        if (a.indexOf(d.documentType) === -1) {
          a.push(d.documentType);
        }
        return a;
      }, []);
      this.docs = data;
      for (const t of uniqueType) {
        let i = 0;
        const node = { name: t, children: [], childCount: 0 };
        for (const d of this.docs.filter(x => x.documentType === t)) {
          i++;
          node.children.push({
            name: d.name,
            index: i,
            documentNumber: d.documentNumber,
            documentDate: d.documentDate
          });
        }
        node.childCount = node.children.length;
        this.TREE_DATA.push(node);
      }
      this.dataSource = new MatTreeFlatDataSource(
        this.treeControl,
        this.treeFlattener
      );
      this.dataSource.data = this.TREE_DATA;
      this.changeDetectorRefs.detectChanges();
    });
  }

  valueSearch(value: string) {}

  closeForm() {
    this.dialogRef.close();
  }
}
