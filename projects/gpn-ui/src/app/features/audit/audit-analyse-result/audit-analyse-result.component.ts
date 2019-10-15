import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit
} from '@angular/core';
import { ActivatedRoute } from '@root/node_modules/@angular/router';
import { AuditService } from '@app/features/audit/audit.service';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@root/node_modules/@angular/material';
import { DocumentAnalyze } from '@app/models/document-analyze';
import { Tag } from '@app/models/legal-document';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';

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
  selector: 'gpn-audit-analyse-result',
  templateUrl: './audit-analyse-result.component.html',
  styleUrls: ['./audit-analyse-result.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditAnalyseResultComponent implements OnInit, AfterViewInit {
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  IdAudit;
  docs: DocumentAnalyze;
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
    private activatedRoute: ActivatedRoute,
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef
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

  refreshData() {
    this.auditservice.getDoumentsAnalyze(this.IdAudit).subscribe(data => {
      const uniqueType = ['CONTRACT'];
      this.docs = data;
      for (const t of uniqueType) {
        const node = { name: t, children: [], childCount: 0 };
        const nodeChild = { name: this.docs._id, children: [], childCount: 0 };
        const atr = this.json2array(data.attributes);

        for (const _atr of atr) {
          nodeChild.children.push({
            name: _atr.display_value,
            confidence: _atr.confidence,
            kind: _atr.kind
          });
        }
        nodeChild.childCount = nodeChild.children.length;
        node.children.push(nodeChild);
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
}
