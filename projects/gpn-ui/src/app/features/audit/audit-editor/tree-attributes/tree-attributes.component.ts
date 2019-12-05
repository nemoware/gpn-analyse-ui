import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Tag } from '@app/models/legal-document';
import { Document } from '@app/models/document.model';
import {
  faChevronDown,
  faChevronUp,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@root/node_modules/@angular/material';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import { Helper } from '@app/features/audit/helper';
import { HeaderModel } from '@app/models/header-model';
import { AttributeModel } from '@app/models/attribute-model';

interface Node {
  display_value?: string;
  value: string;
  children?: Node[];
  kind?: string;
  index?: number;
  idWord?: string;
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'gpn-tree-attributes',
  templateUrl: './tree-attributes.component.html',
  styleUrls: ['./tree-attributes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeAttributesComponent implements OnInit, AfterViewInit {
  @Input() attributes: Array<AttributeModel>;
  @Input() headers: HeaderModel[];
  @Input() editmode: boolean;
  @Input() documentType: string[];
  @Output() goToAttribute = new EventEmitter<string>();

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faEye = faEye;
  IdAudit;
  docs: Document[];
  TREE_DATA: Node[] = [];

  treeControl;
  treeFlattener;
  dataSource;
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      display_value: node.display_value,
      value: node.value,
      kind: node.kind,
      level: level,
      index: node.index,
      idWord: node.idWord
    };
  };

  constructor(private changeDetectorRefs: ChangeDetectorRef) {}

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
    let i = 1;
    const nodeH = {
      kind: 'HEADERS',
      value: 'HEADERS',
      children: [],
      childCount: 0
    };
    for (const h of this.headers) {
      this.TREE_DATA.push({
        index: i++,
        value: h.value,
        display_value: h.display_value,
        kind: 'header',
        idWord: 'span_' + (h.span ? h.span[0] : -1)
      });
    }
    /*
    const nodeA = {
      kind: 'ATTRIBUTES',
      value: 'ATTRIBUTES',
      children: [],
      childCount: 0
    };
    i = 1;
    this.sortAttributes();
    for (const a of this.attributes) {
      const child = {
        index: i++,
        value: a.value,
        display_value: a.display_value,
        kind: a.kind,
        idWord: 'span_' + (a.span ? a.span[0] : -1),
        children: []
      };

      if (a.parent) {
        const p = this.getParent(a.parent, nodeA.children);
        console.log(p);
        if (p) p.children.push(child);
      } else {
        nodeA.children.push(child);
      }
    }*/
    //this.TREE_DATA.push(nodeA);
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataSource.data = this.TREE_DATA;
    this.treeControl.expand(
      this.treeControl.dataNodes.find(x => x.value === 'HEADERS')
    );
    /*this.treeControl.expand(
      this.treeControl.dataNodes.find(x => x.value === 'ATTRIBUTES')
    );*/
    this.changeDetectorRefs.detectChanges();
  }

  getParent(name: string, children: any[]): any {
    for (const c of children) {
      if (c.kind === name) return c;
      if (c.children) {
        const p = this.getParent(name, c.children);
        if (p) return p;
      }
    }
  }

  ngAfterViewInit(): void {
    this.refreshData();
  }

  clickAttribute(node) {
    this.goToAttribute.emit(node.idWord);
  }

  public updateAttributes(attributes: AttributeModel[]) {
    this.attributes = attributes;
    //this.refreshData();
  }

  sortAttributes() {
    this.attributes = this.attributes.sort((a, b) => {
      if (!a.parent || !b.parent) return 0;
      return a.parent.localeCompare(b.parent);
    });
  }
}
