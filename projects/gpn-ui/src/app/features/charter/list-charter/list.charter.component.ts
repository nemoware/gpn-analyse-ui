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
import { faSearch, faCog } from '@fortawesome/free-solid-svg-icons';
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
  faCog = faCog;
  columns: string[] = [
    'subsidiaryName',
    'charterStart',
    'charterEnd',
    'lastEditDate',
    'lastEditUser',
    'events'
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
    this.charterService.getCharters(filter).subscribe(data => {
      this.documents = data;
      if (data) {
        this.setEndDates();
      }
      this.refreshViewTable();
    });
  }

  refreshViewTable() {
    this.count = this.documents.length;
    this.activePageDataChunk = this.documents.slice(0, this.pageSize);
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

    this.activePageDataChunk = this.documents.slice(firstCut, secondCut);
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
    if (sortHeaderId === 'subsidiaryName')
      return data.attributes['org-1-name'].value;
    if (sortHeaderId === 'charterStart') return data.documentDate;
    if (sortHeaderId === 'lastEditDate') return data.analysis.analyze_timestamp;
    if (sortHeaderId === 'charterEnd')
      return data.documentEndDate || 'Действующий';
    if (sortHeaderId === 'lastEditUser')
      if (data.user) return data.user.author.name;
      else return 'Анализатор';

    return -1;
  };

  openDocument(doc) {
    window.open(window.location.origin + '/#/audit/view/' + doc._id, '_blank');
  }

  uploadCharter() {
    const dialogRef = this.dialog.open(CreateCharterComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //TODO: afterResult
      }
    });
  }

  deactivateCharter(el, event) {
    event.stopPropagation();
    if (el != null) {
      if (
        confirm(
          `Вы действительно хотите деактивировать "Устав ${
            el.analysis.attributes['org-1-name'].value
          } от ${this.datepipe.transform(el.documentDate, 'dd.MM.yyyy')}"?`
        )
      ) {
        //TODO: deactivation
      }
    }
  }

  setEndDates() {
    const listOfSubsidiaries = this.documents.map(
      document => document.analysis.attributes['org-1-name'].value
    );
    const uniqueSubsidiaries = listOfSubsidiaries.filter(
      (e, i, a) => a.indexOf(e) !== i
    );
    uniqueSubsidiaries.forEach(subsidiary => {
      const indexes = listOfSubsidiaries
        .map((car, i) => (car === subsidiary ? i : -1))
        .filter(index => index !== -1);
      const charterDates = this.documents
        .filter((document, index) => indexes.includes(index))
        .sort(compare);
      this.documents.forEach(document => {
        charterDates.forEach((charter, i) => {
          if (document._id === charter._id && i !== 0) {
            document.documentEndDate = charterDates[--i].documentDate;
          }
        });
      });
    });
  }
}

function compare(a, b) {
  if (a.documentDate > b.documentDate) {
    return -1;
  }
  if (a.documentDate < b.documentDate) {
    return 1;
  }
  return 0;
}
