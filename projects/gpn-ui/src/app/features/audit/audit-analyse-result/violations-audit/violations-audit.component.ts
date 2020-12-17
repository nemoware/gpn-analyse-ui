import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import {
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { AuditService } from '@app/features/audit/audit.service';
import { ViolationModel } from '@app/models/violation-model';
import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@root/node_modules/@angular/animations';
import { Helper } from '@app/features/audit/helper';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { SelectionModel } from '@root/node_modules/@angular/cdk/collections';

@Component({
  selector: 'gpn-violations-audit',
  templateUrl: './violations-audit.component.html',
  styleUrls: ['./violations-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [state('expanded', style({ height: '*' }))])
  ]
})
export class ViolationsAuditComponent implements OnInit {
  col: string[] = [
    'document',
    'founding_document',
    'reference',
    'violation_type',
    'violation_reason',
    'select'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  violations: ViolationModel[];
  selection = new SelectionModel<ViolationModel>(true, []);

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() idAudit: string;
  @Input() conclusion: boolean;
  @Output() selectedRowsEvent = new EventEmitter<ViolationModel[]>();

  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  emitSelected() {
    this.selectedRowsEvent.emit(this.selection.selected);
    return true;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    this.emitSelected();
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
    this.emitSelected();
  }

  _sortingDataAccessor: (data, sortHeaderId: string) => string | number = (
    data,
    sortHeaderId: string
  ): string | number => {
    return this.getAttrValue(sortHeaderId, data);
  };

  getAttrValue(attr, data) {
    switch (attr) {
      case 'violation_type': {
        return data.violation_type;
      }
      case 'document': {
        return data.document.type;
      }
      case 'founding_document': {
        return data.founding_document ? data.founding_document.type : 'null';
      }
      case 'violation_reason': {
        return data.reference ? data.reference.type : 'null';
      }
    }
  }

  ngOnInit() {
    if (this.conclusion) {
      this.col.shift();
    } else {
      this.col.pop();
    }
    this.auditservice.getViolations(this.idAudit).subscribe(data => {
      if (data) {
        this.dataSource.sortingDataAccessor = this._sortingDataAccessor;
        this.dataSource.sort = this.sort;
        this.dataSource.data = data.filter(x => {
          return x.violation_type;
        });
        this.masterToggle();
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  getKindAttribute(key: string) {
    const atr = Helper.parseKind(key);
    return atr.kind;
  }

  getViolation(row) {
    if (
      Object.prototype.toString.call(row.violation_type) === '[object String]'
    )
      return this.translate.instant(row.violation_type);
    else {
      return this.translate.instant(row.violation_type.type);
      const type = this.translate.instant(row.violation_type.type);
      const org_structural_level = row.violation_type.org_structural_level
        ? this.translate.instant(row.violation_type.org_structural_level)
        : '';
      const subject = row.violation_type.subject
        ? this.translate.instant(row.violation_type.subject)
        : '';
    }
  }

  openDocument(id, attribute?) {
    window.open(
      window.location.origin +
        '/#/audit/edit/' +
        id +
        (attribute ? '?attribute=' + attribute : ''),
      '_blank'
    );
  }
}
