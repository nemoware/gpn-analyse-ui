import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from '@angular/core';
import {
  MatDialog,
  MatPaginator,
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { DatePipe } from '@root/node_modules/@angular/common';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Document } from '@app/models/document.model';
import { CharterService } from '@app/features/charter/charter.service';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { CreateCharterComponent } from '@app/features/charter/create-charter/create-charter.component';

@Component({
  selector: 'gpn-list-charter',
  templateUrl: './list.charter.component.html',
  styleUrls: ['./list.charter.component.scss'],
  providers: [CharterService, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListCharterComponent implements OnInit, AfterViewInit {
  faSearch = faSearch;
  columns: string[] = [
    'subsidiaryName',
    'charterStart',
    'charterEnd',
    'lastEditDate',
    'lastEditUser',
    'analyze_state'
  ];

  dataSource = new MatTableDataSource();
  activePageDataChunk = [];
  documents: Document[];
  count = 0;
  pageIndex = 0;
  pageSize = 15;
  lowValue = 0;
  highValue = 15;
  mouseOverIndex = -1;
  delete = false;
  currentFilter = [];
  showInactive = false;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private translate: TranslateService,
    private charterService: CharterService,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    public datepipe: DatePipe
  ) {}

  ngOnInit() {
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
  }

  ngAfterViewInit(): void {
    this.refreshData();
  }

  refreshData(filter: Array<{ name: string; value: string }> = null) {
    this.currentFilter = filter;
    this.charterService.getCharters(filter).subscribe(data => {
      this.documents = data;
      this.refreshViewTable();
    });
  }

  refreshViewTable() {
    if (!this.showInactive) {
      this.count = this.documents.filter(doc => doc.isActive).length;
      this.activePageDataChunk = this.documents
        .filter(doc => doc.isActive)
        .slice(0, this.pageSize);
    } else {
      this.count = this.documents.length;
      this.activePageDataChunk = this.documents.slice(0, this.pageSize);
    }
    this.paginator.pageIndex = 0;
    this.pageIndex = 0;
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sortingDataAccessor = this._sortingDataAccessor;
    this.dataSource.sort = this.sort;
    this.changeDetectorRefs.detectChanges();
  }

  getPaginatorData(event) {
    if (event.pageIndex === this.pageIndex + 1) {
      this.lowValue = this.lowValue + this.pageSize;
      this.highValue = this.highValue + this.pageSize;
    } else if (event.pageIndex === this.pageIndex - 1) {
      this.lowValue = this.lowValue - this.pageSize;
      this.highValue = this.highValue - this.pageSize;
    }
    this.pageIndex = event.pageIndex;

    const firstCut = event.pageIndex * event.pageSize;
    const secondCut = firstCut + event.pageSize;
    if (!this.showInactive)
      this.activePageDataChunk = this.documents
        .filter(doc => doc.isActive)
        .slice(firstCut, secondCut);
    else this.activePageDataChunk = this.documents.slice(firstCut, secondCut);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sortingDataAccessor = this._sortingDataAccessor;
    this.dataSource.sort = this.sort;
  }

  valueSearch(value: string) {
    const filterValue = new Array<{ name: string; value: string }>();
    if (value.length > 0) {
      filterValue.push({ name: 'name', value: value });
    }
    this.refreshData(filterValue);
  }

  onMouseOver(index) {
    this.mouseOverIndex = index;
  }

  _sortingDataAccessor: (data, sortHeaderId: string) => string | number = (
    data,
    sortHeaderId: string
  ): string | number => {
    if (sortHeaderId === 'analyze_state') {
      if (
        data.state === 0 ||
        data.state === 1 ||
        data.state === 5 ||
        data.state === null
      )
        return 'Загружен, ожидает анализа' + data.analyze_timestamp;
      if (data.state === 10) return 'Анализируется' + data.analyze_timestamp;
      if (data.state === 11)
        return 'Ошибка при анализе' + data.analyze_timestamp;
      if (data.state === 12)
        return (
          'Документ не попадает под параметры Аудита' + data.analyze_timestamp
        );
      if (data.state === 15) return 'Анализ завершен' + data.analyze_timestamp;
      return ' ';
    }
    if (sortHeaderId === 'subsidiaryName') return data.subsidiary;
    if (sortHeaderId === 'charterStart') return data.fromDate;
    if (sortHeaderId === 'lastEditDate') return data.analyze_timestamp;
    if (sortHeaderId === 'charterEnd')
      if (!data.isActive) return 'Неактивный';
      else return data.toDate || 'Действующий';
    if (sortHeaderId === 'lastEditUser')
      if (data.user) return data.user;
      else return 'Анализатор';

    return -1;
  };

  openDocument(doc) {
    if (!(doc.state === 0 || doc.state === 5 || doc.state === null))
      window.open(
        window.location.origin + '/#/audit/view/' + doc._id,
        '_blank'
      );
  }

  uploadCharter() {
    const dialogRef = this.dialog.open(CreateCharterComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.documents.unshift(result);
        this.refreshViewTable();
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  showCharters() {
    this.showInactive = !this.showInactive;
    this.refreshViewTable();
  }
}
