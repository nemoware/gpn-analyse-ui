import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import {
  MatSort,
  MatTableDataSource,
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@root/node_modules/@angular/material';
import { ViolationModel } from '@app/models/violation-model';
import { state, style, trigger } from '@root/node_modules/@angular/animations';
import { takeUntil } from 'rxjs/operators';
import { Subject } from '@root/node_modules/rxjs';
import { PreAuditService } from '@app/features/pre-audit/pre-audit.service';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Tag } from '@app/models/legal-document';
interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface Node {
  _id?: string;
  name: string;
  children?: any[];
  details?: Tag;
  childCount?: number;
  index?: number;
  type?: string;
  docs?: [];
}

const checkTypes = ['InsiderControl', 'InterestControl'];
@Component({
  selector: 'gpn-violations-pre-audit',
  templateUrl: './violations-pre-audit.component.html',
  styleUrls: ['./violations-pre-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [state('expanded', style({ height: '*' }))])
  ]
})
export class ViolationsPreAuditComponent implements OnInit, OnDestroy {
  col: string[] = ['filename', 'org2'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  violations: ViolationModel[];
  treeControl;
  treeFlattener;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  TREE_DATA: Node[] = [];
  treeDataSource;
  docs;
  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      childCount: node.childCount,
      level: level,
      index: node.index,
      docs: node.docs
    };
  };
  private destroyStream = new Subject<void>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() idAudit: string;

  constructor(
    private preAuditService: PreAuditService,
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
    this.preAuditService
      .getViolations(this.idAudit)
      .pipe(takeUntil(this.destroyStream))
      .subscribe(data => {
        if (data.length) {
          this.docs = data[0].violations;
          this.dataSource.sort = this.sort;
          this.dataSource.data = data;
          for (const t of checkTypes) {
            let i = 0;
            const node = { name: t, children: [], childCount: 0 };
            const docs = { docs: [] };
            for (const d of this.docs.filter(x => x.type === t)) {
              d.index = i;
              i++;
              docs.docs.push(d);
              node.childCount = docs.docs.length;
            }
            node.children.push(docs);
            if (docs.docs.length > 0) this.TREE_DATA.push(node);
          }
          this.refreshTree();
          this.changeDetectorRefs.detectChanges();
        }
      });
  }

  openDocument(element) {
    window.open(
      window.location.origin + '/#/pre-audit/edit/' + element.document_id,
      '_blank'
    );
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }

  refreshTree() {
    this.treeDataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.treeDataSource.data = this.TREE_DATA;
    this.treeControl.expandAll();
    this.changeDetectorRefs.detectChanges();
  }
}
