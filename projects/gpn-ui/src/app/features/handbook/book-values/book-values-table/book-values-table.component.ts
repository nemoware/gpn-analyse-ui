import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
import { ChangeDetectorRef, ViewChild } from '@root/node_modules/@angular/core';
import { MatPaginator } from '@root/node_modules/@angular/material/paginator';
import { MatSort } from '@root/node_modules/@angular/material/sort';
import { MatTable } from '@root/node_modules/@angular/material/table';
import { Subject } from '@root/node_modules/rxjs';
import { HandBookService } from '@app/features/handbook/hand-book.service';
import { Router } from '@root/node_modules/@angular/router';
import { MatDialog } from '@root/node_modules/@angular/material';
import { takeUntil } from '@root/node_modules/rxjs/operators';
import { BookValuesTableDatasource } from '@app/features/handbook/book-values/book-values-table/book-values-table.datasource';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { BookValue } from '@app/models/bookValue';
import { BookValuesFormComponent } from '@app/features/handbook/book-values/book-values-form/book-values-form.component';
import { DatePipe } from '@root/node_modules/@angular/common';

@Component({
  selector: 'gpn-book-values-table',
  templateUrl: './book-values-table.component.html',
  styleUrls: ['./book-values-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe]
})
export class BookValuesTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatTable, { static: false }) table: MatTable<BookValue>;
  dataSource: BookValuesTableDatasource;
  data: BookValue[];
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['date', 'value', 'events'];
  faTrashAlt = faTrashAlt;
  mouseOverIndex = -1;
  private destroyStream = new Subject<void>();

  ngOnInit() {
    this.GetRefreshTable();
  }

  constructor(
    private handBookService: HandBookService,
    private router: Router,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    public datepipe: DatePipe
  ) {}

  LocalRefreshTable(data: any[]) {
    this.dataSource = new BookValuesTableDatasource(data);
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.table.dataSource = this.dataSource;
    this.changeDetectorRefs.detectChanges();
  }

  GetRefreshTable() {
    this.handBookService
      .getBookValues()
      .pipe(takeUntil(this.destroyStream))
      .subscribe((data: any[]) => {
        this.data = data;
        this.LocalRefreshTable(this.data);
      });
  }

  deleteBookValue(element: any, event: MouseEvent) {
    event.stopPropagation();
    if (element != null) {
      if (
        confirm(
          `Вы действительно хотите удалить балансовую стоимость от ${this.datepipe.transform(
            element.date,
            'MM.yyyy'
          )}?`
        )
      ) {
        this.handBookService
          .deleteBookValue(element._id)
          .pipe(takeUntil(this.destroyStream))
          .subscribe(
            () => {
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
        item.date = newValue.date;
        item.value = newValue.value;
        return item;
      }
    });
  }

  onMouseOver(index) {
    this.mouseOverIndex = index;
  }

  addBookValue() {
    const dialogRef = this.dialog.open(BookValuesFormComponent, {
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

  editBookValue(row: any) {
    const bookValue: BookValue = {
      date: row.date,
      value: row.value,
      _id: row._id
    };

    const dialogRef = this.dialog.open(BookValuesFormComponent, {
      width: '50%',
      data: {
        dataSource: this.data,
        new: false,
        bookValue
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

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
