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
  faTimes
} from '@fortawesome/free-solid-svg-icons';
interface Node {
  name: string;
  children?: Node[];
}

interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  level: number;
}

@Component({
  selector: 'gpn-audit-result',
  templateUrl: './audit-result.component.html',
  styleUrls: ['./audit-result.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditResultComponent implements OnInit, AfterViewInit {
  faSearch = faSearch;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faTimes = faTimes;
  docs: DocumentParser[];
  TREE_DATA: Node[] = [];

  treeControl;
  treeFlattener;
  dataSource;
  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  private _transformer = (node: Node, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level
    };
  };

  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    public dialogRef: MatDialogRef<AuditResultComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      auditId: string;
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
    this.auditservice.getDoumentsParser().subscribe(data => {
      const uniqueType = data.reduce(function(a, d) {
        if (a.indexOf(d.documentType) === -1) {
          a.push(d.documentType);
        }
        return a;
      }, []);
      this.docs = data;

      for (const t of uniqueType) {
        const node = { name: t, children: [] };
        for (const d of this.docs.filter(x => x.documentType === t)) {
          node.children.push({ name: d.name });
        }
        this.TREE_DATA.push(node);
      }
      console.log(this.TREE_DATA);
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
