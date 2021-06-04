import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import {
  MatTreeFlattener,
  MatTreeFlatDataSource
} from '@root/node_modules/@angular/material';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
interface TreeNode {
  name: string;
  children?: TreeNode[];
  min?: number;
  max?: number;
  currency?: string;
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'gpn-child-detail',
  templateUrl: './child-detail.component.html',
  styleUrls: ['./child-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildDetailComponent implements OnInit {
  constructor(private translate: TranslateService) {}
  @Input() document: any;
  @Input() documentType: any;
  TREE_DATA: TreeNode[];
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable
  );

  private _transformer = (node: TreeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      min: node.min,
      max: node.max,
      currency: node.currency
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  ngOnInit() {
    console.log('this.document');
    console.log(this.document);

    console.log('this.documentType');
    console.log(this.documentType);

    console.log('document.attributes');
    console.log(this.document.attributes);

    if (this.document) {
      this.TREE_DATA = this.documentType.children.getTreeAttributes(
        this.document.attributes
      );
      console.log('this.TREE_DATA');
      console.log(this.TREE_DATA);

      this.dataSource.data = this.TREE_DATA;
    }
  }
}
