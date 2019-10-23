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
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import { Document } from '@app/models/document.model';
import { Helper } from '@app/features/audit/helper';
import { Audit } from '@app/models/audit.model';
import { forEachComment } from '@root/node_modules/tslint';

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
  IdAudit;
  docs: Document[];
  TREE_DATA: Node[] = [];
  audit: Audit;
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
      documentNumber: node.documentNumber,
      _id: node._id,
      parseError: node.parseError
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
        console.log(data);
        this.audit = data[0];
        this.refreshData();
      });
  }

  refreshData() {
    this.auditservice.getDouments(this.IdAudit, false).subscribe(data => {
      console.log(data);
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
          const nodeChild = {
            _id: d._id,
            name: d.name,
            index: i,
            documentNumber: d.documentNumber,
            documentDate: d.documentDate,
            children: [],
            childCount: 0,
            parseError: d.parseError
          };

          if (d.analysis.attributes) {
            const atr = Helper.json2array(d.analysis.attributes);
            let j = 1;
            for (const _atr of atr) {
              nodeChild.children.push({
                index: j++,
                name: _atr.display_value,
                confidence: _atr.confidence,
                kind: _atr.kind
              });
            }
          }
          nodeChild.childCount = nodeChild.children.length;
          node.children.push(nodeChild);

          node.childCount = node.children.length;
        }
        this.TREE_DATA.push(node);
      }
      this.dataSource = new MatTreeFlatDataSource(
        this.treeControl,
        this.treeFlattener
      );
      this.dataSource.data = this.TREE_DATA;
      for (const n of this.treeControl.dataNodes) {
        if (n.level === 0) this.treeControl.expand(n);
      }

      this.changeDetectorRefs.detectChanges();
    });
  }

  openEditor(node) {
    this.router.navigate(['audit/view/', node._id]);
  }

  openError(node) {
    if (node.parseError) alert(node.parseError);
  }
}
