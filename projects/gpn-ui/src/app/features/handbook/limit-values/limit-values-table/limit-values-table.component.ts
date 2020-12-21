import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { LimitValuesTableDatasource } from './limit-values-table-datasource';
import { HandBookService } from '@app/features/handbook/hand-book.service';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@root/node_modules/@angular/router';
import { MatDialog } from '@root/node_modules/@angular/material';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@root/node_modules/@angular/core';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { LimitValue, SubLimit } from '@app/models/limitValue.model';
import { LimitValuesFormComponent } from '@app/features/handbook/limit-values/limit-values-form/limit-values-form.component';
import { element } from 'protractor';
@Component({
  selector: 'gpn-limit-values-table',
  templateUrl: './limit-values-table.component.html',
  styleUrls: ['./limit-values-table.component.scss'],
  providers: [HandBookService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LimitValuesTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<LimitValue>;
  dataSource: LimitValuesTableDatasource;
  data: LimitValue[];
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
    'startDate',
    'lowerLimit',
    'upperLimit',
    'limitValue',
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
    this.dataSource = new LimitValuesTableDatasource(data);
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
    this.changeDetectorRefs.detectChanges();
  }

  GetRefreshTable() {
    this.handBookService.getLimitValues().subscribe((data: any[]) => {
      this.data = data;
      this.LocalRefreshTable(this.data);
    });
  }

  deleteLimitValue(elem: any, event: MouseEvent) {
    event.stopPropagation();
    if (elem != null) {
      if (confirm(`Вы действительно хотите удалить предельное значение?`)) {
        this.handBookService.deleteLimitValue(elem._id).subscribe(
          data => {
            this.data = this.arrayRemove(this.data, elem);
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
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === oldValue) {
        arr[i] = newValue;
        return;
      }
    }
  }

  onMouseOver(index) {
    this.mouseOverIndex = index;
  }

  addLimitValue() {
    const dialogRef = this.dialog.open(LimitValuesFormComponent, {
      width: '50%',
      data: { dataSource: this.data, new: true },
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

  // row2Limits(row: any){
  //   const lowerLimits = row.lowerLimit.split(/\r?\n/);
  //   const upperLimits = row.upperLimit.split(/\r?\n/);
  //   const limitValues = row.limitValue.split(/\r?\n/);
  //   const _limits: SubLimit[] = [limitValues.length];
  //   for (let _i = 0; _i < limitValues.length; _i++){
  //     _limits[_i] = {
  //       lowerLimit: lowerLimits[_i],
  //       upperLimit: upperLimits[_i],
  //       limitValue: limitValues[_i]
  //     };
  //   }
  //   return _limits;
  // }

  editLimitValue(row: any) {
    const limitValue: LimitValue = {
      startDate: row.startDate,
      _id: row._id,
      limits: row.limits
    };

    const dialogRef = this.dialog.open(LimitValuesFormComponent, {
      width: '50%',
      data: {
        dataSource: this.data,
        new: false,
        limitValue
      },
      maxHeight: '90vh'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editArray(this.data, row, result);
        this.LocalRefreshTable(this.data);
        this.changeDetectorRefs.detectChanges();
      }
    });
  }
}
