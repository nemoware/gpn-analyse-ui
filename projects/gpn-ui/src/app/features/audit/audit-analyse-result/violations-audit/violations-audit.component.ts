import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import {
  MatDialog,
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { AuditService } from '@app/features/audit/audit.service';
import { ViolationModel } from '@app/models/violation-model';
import { state, style, trigger } from '@root/node_modules/@angular/animations';
import { Helper } from '@app/features/audit/helper';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { SelectionModel } from '@root/node_modules/@angular/cdk/collections';
import { takeUntil } from 'rxjs/operators';
import { Subject } from '@root/node_modules/rxjs';
import { AddViolationComponent } from '@app/features/audit/audit-editor/add-violation/add-violation.component';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'gpn-violations-audit',
  templateUrl: './violations-audit.component.html',
  styleUrls: ['./violations-audit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [state('expanded', style({ height: '*' }))])
  ]
})
export class ViolationsAuditComponent implements OnInit, OnDestroy {
  col: string[] = [
    'document',
    'creator',
    'founding_document',
    'reference',
    'violation_type',
    'violation_reason',
    'events',
    'select'
  ];
  faTrashAlt = faTrashAlt;
  mouseOverIndex = -1;
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  violations: ViolationModel[];
  selection = new SelectionModel<ViolationModel>(true, []);
  private destroyStream = new Subject<void>();
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @Input() idAudit: string;
  @Input() conclusion: boolean;
  @Input() selectedRows: ViolationModel[];
  @Output() selectedRowsEvent = new EventEmitter<ViolationModel[]>();

  constructor(
    private auditservice: AuditService,
    private changeDetectorRefs: ChangeDetectorRef,
    private translate: TranslateService,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  emitSelected() {
    this.auditservice
      .postSelectedViolations(this.idAudit, this.selection.selected)
      .pipe(takeUntil(this.destroyStream))
      .subscribe();
    this.selectedRowsEvent.emit(this.selection.selected);
    return true;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
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
    //Если заключение
    if (this.conclusion) {
      this.col.shift();
      this.col.pop();
    }
    if (this.conclusion && this.selectedRows) {
      this.dataSource.sortingDataAccessor = this._sortingDataAccessor;
      this.dataSource.sort = this.sort;
      this.dataSource.data = this.selectedRows.filter(x => {
        return x.violation_type;
      });
    } else {
      this.getViolations();
    }
  }

  getViolations() {
    this.auditservice
      .getViolations(this.idAudit)
      .pipe(takeUntil(this.destroyStream))
      .subscribe(data => {
        if (data) {
          this.dataSource.sortingDataAccessor = this._sortingDataAccessor;
          this.dataSource.sort = this.sort;
          this.dataSource.data = data.filter(x => {
            return x.violation_type;
          });
          if (this.selectedRows) {
            this.dataSource.data.forEach(row => {
              if (!row.userViolation) {
                for (let i = 0; i < this.selectedRows.length; i++) {
                  if (this.compareDocs(row, this.selectedRows[i])) {
                    this.selection.select(row);
                  }
                }
              }
            });
          } else if (!this.conclusion) {
            this.masterToggle();
          }
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

  compareDocs(doc1: ViolationModel, doc2: ViolationModel) {
    return (
      doc1.document.id === doc2.document.id &&
      (doc1.founding_document && doc1.founding_document.id) ===
        (doc2.founding_document && doc2.founding_document.id)
    );
  }

  toggleSelection(row) {
    this.selection.toggle(row);
    this.emitSelected();
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }

  editViolation(row: any, index) {
    if (row.userViolation) {
      const violation = {
        violation_type: row.violation_type,
        violation_text: row.violation_text,
        violation_reason: row.violation_reason,
        violation_reason_text: row.violation_reason_text,
        reference: row.reference,
        id: row.id
      };
      const dialogRef = this.dialog.open(AddViolationComponent, {
        width: '1000px',
        data: {
          new: false,
          violation,
          index,
          document: {
            auditId: this.idAudit
          }
        },
        maxHeight: '90vh'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.getViolations();
        }
      });
    }
  }

  onMouseOver(index) {
    this.mouseOverIndex = index;
  }

  deleteViolation(element: any, event: MouseEvent) {
    event.stopPropagation();
    if (element != null) {
      if (
        confirm(
          `Вы действительно хотите удалить Нарушение "${this.translateService.instant(
            element.violation_type
          )}"?`
        )
      ) {
        this.auditservice
          .deleteViolation(this.idAudit, element.id)
          .pipe(takeUntil(this.destroyStream))
          .subscribe(() => {
            this.getViolations();
          });
      }
    }
  }
}
