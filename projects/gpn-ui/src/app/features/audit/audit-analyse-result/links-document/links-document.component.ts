import { Document } from '@app/models/document.model';
import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Input,
  ChangeDetectorRef
} from '@angular/core';
import { FlatTreeControl } from '@root/node_modules/@angular/cdk/tree';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@root/node_modules/@angular/material';
import { AuditService } from '@app/features/audit/audit.service';
// tslint:disable-next-line:import-blacklist
import { takeUntil } from '@root/node_modules/rxjs/internal/operators';
import { Subject } from '@root/node_modules/rxjs';

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

interface Node {
  name: string;
  docType: string;
  count?: number;
  document?: Document;
  children?: Node[];
}

@Component({
  selector: 'gpn-links-document',
  templateUrl: './links-document.component.html',
  styleUrls: ['./links-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinksDocumentComponent implements OnInit, AfterViewInit {
  @Input() documentId: string;
  @Input() auditId: string;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  Data_node: Node[] = [];
  private destroyStream = new Subject<void>();
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      childCount: node.count,
      document: node.document
    };
  };

  treeControl = new FlatTreeControl<ExampleFlatNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private auditservice: AuditService
  ) {}

  ngAfterViewInit(): void {
    this.refreshData();
  }

  ngOnInit() {
    this.auditservice
      .getTreeLinks(this.documentId)
      .pipe(takeUntil(this.destroyStream))
      .subscribe(data => {
        this.Data_node.push(
          {
            name: 'Дополнительное соглашение',
            docType: 'SupplementaryAgreement'
          },
          {
            name: 'Приложение',
            docType: 'Annex'
          }
        );

        this.Data_node = this.Data_node.filter(i => data[i.docType].length).map(
          i => {
            i.children = [
              {
                name: 'qwe',
                docType: undefined,
                document: data[i.docType]
              }
            ];
            i.count = data[i.docType].length;
            return i;
          }
        );

        this.refreshData();
      });
  }

  refreshData() {
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    this.dataSource.data = this.Data_node;
    this.changeDetectorRefs.detectChanges();
  }
}
