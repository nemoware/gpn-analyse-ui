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
  @Input() document: any;
  @Input() documentType: any;
  constructor(private translate: TranslateService) {}
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
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );
  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  ngOnInit() {
    if (this.document) {
      this.TREE_DATA = this.documentType.children.getTreeAttributes(
        this.document.attributes
      );

      /*
      this.TREE_DATA = [
        {
          name: 'Fruit',
          children: [
            {name: 'Apple'},
            {name: 'Banana'},
            {name: 'Fruit loops'},
          ]
        }, {
          name: 'Vegetables',
          children: [
            {
              name: 'Green',
              children: [
                {name: 'Broccoli'},
                {name: 'Brussel sprouts'},
              ]
            }, {
              name: 'Orange',
              children: [
                {name: 'Pumpkins'},
                {name: 'Carrots'},
              ]
            },
          ]
        },
      ];
*/
      this.dataSource.data = this.TREE_DATA;
    }
  }
}
