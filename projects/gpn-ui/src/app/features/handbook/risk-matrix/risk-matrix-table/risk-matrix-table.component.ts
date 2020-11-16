import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { RiskMatrixTableDataSource } from './risk-matrix-table-datasource';
import { HandBookService } from '@app/features/handbook/hand-book.service';
import { RiskMatrix } from '@app/models/riskMatrix.model';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@root/node_modules/@angular/router';
import { MatDialog } from '@root/node_modules/@angular/material';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@root/node_modules/@angular/core';
import { RiskMatrixFormComponent } from '@app/features/handbook/risk-matrix/risk-matrix-form/risk-matrix-form.component';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
@Component({
  selector: 'gpn-risk-matrix-table',
  templateUrl: './risk-matrix-table.component.html',
  styleUrls: ['./risk-matrix-table.component.scss'],
  providers: [HandBookService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskMatrixTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<RiskMatrix>;
  dataSource: RiskMatrixTableDataSource;
  data: RiskMatrix[];
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
    'violation',
    'subject',
    'risk',
    'recommendation',
    'disadvantage',
    'events'
  ];
  faTrashAlt = faTrashAlt;
  mouseOverIndex = -1;

  ngOnInit() {
    this.GetRefreshTable();
  }

  constructor(
    private handBookService: HandBookService,
    private router: Router,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    private translateService: TranslateService
  ) {}

  LocalRefreshTable(data: any[]) {
    this.dataSource = new RiskMatrixTableDataSource(data);
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
    this.changeDetectorRefs.detectChanges();
  }

  GetRefreshTable() {
    this.handBookService.getRiskMatrix().subscribe((data: any[]) => {
      this.data = data;
      this.LocalRefreshTable(this.data);
    });
  }

  deleteRisk(element: any, event: MouseEvent) {
    event.stopPropagation();
    if (element != null) {
      if (
        confirm(
          `Вы действительно хотите удалить Нарушение "${this.translateService.instant(
            element.violation
          )}"?`
        )
      ) {
        this.handBookService.deleteRisk(element._id).subscribe(
          data => {
            this.data = this.arrayRemove(this.data, element);
            this.LocalRefreshTable(this.data);
          },
          error => {
            alert(error.message());
          }
        );
      }
    }
  }

  arrayRemove(arr, value) {
    return arr.filter(item => {
      return item !== value;
    });
  }

  editArray(arr, oldValue, newValue) {
    return arr.filter(item => {
      if (item !== oldValue) {
        return item;
      } else {
        item.disadvantage = newValue.disadvantage;
        item.recommendation = newValue.recommendation;
        item.risk = newValue.risk;
        item.subject = newValue.subject;
        item.violation = newValue.violation;
        return item;
      }
    });
  }

  onMouseOver(index) {
    this.mouseOverIndex = index;
  }

  addRisk() {
    const dialogRef = this.dialog.open(RiskMatrixFormComponent, {
      width: '50%',
      data: { new: true },
      maxHeight: '90vh'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data.push(result);
        this.LocalRefreshTable(this.data);
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  editRisk(row: any) {
    const risk: RiskMatrix = {
      disadvantage: row.disadvantage,
      recommendation: row.recommendation,
      risk: row.risk,
      subject: row.subject,
      violation: row.violation,
      _id: row._id
    };

    const dialogRef = this.dialog.open(RiskMatrixFormComponent, {
      width: '50%',
      data: {
        new: false,
        risk
      },
      maxHeight: '90vh'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.data = this.editArray(this.data, row, result);
        this.LocalRefreshTable(this.data);
        this.changeDetectorRefs.detectChanges();
      }
    });
  }
}
