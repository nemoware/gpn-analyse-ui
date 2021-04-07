import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';
import { DatePipe } from '@root/node_modules/@angular/common';
import {
  MatDialog,
  MatPaginator,
  MatSort
} from '@root/node_modules/@angular/material';
import { Router } from '@root/node_modules/@angular/router';
import { ViewChild } from '@root/node_modules/@angular/core';
import { merge, Subject } from '@root/node_modules/rxjs';
import { takeUntil, tap } from '@root/node_modules/rxjs/operators';
import { CharterDataSource } from '@app/features/charter/charter-data-source';
import { CharterService } from '@app/features/charter/charter.service';

export interface CharterStates {
  id: number;
  name: string;
}

@Component({
  selector: 'gpn-list-charter',
  templateUrl: './list.charter.component.html',
  styleUrls: ['./list.charter.component.scss'],
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListCharterComponent implements OnInit {
  constructor(
    private spinner: NgxSpinnerService,
    private charterService: CharterService,
    public datepipe: DatePipe,
    public dialog: MatDialog,
    private router: Router
  ) {}

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  defPageSize = 15;
  dataSource: CharterDataSource;
  columns: string[] = [
    'subsidiaryName',
    'charterStart',
    'charterEnd',
    'lastEditDate',
    'lastEditUser',
    'analyze_state'
  ];
  documents: Object[];

  charterStates: CharterStates[] = [
    { id: 5, name: 'Загружен, ожидает анализа' },
    { id: 10, name: 'Анализируется' },
    { id: 11, name: 'Ошибка при анализе' },
    { id: 12, name: 'Документ не попадает под параметры Проверки' },
    { id: 15, name: 'Анализ завершен' }
  ];

  _filterValue: [];
  mouseOverIndex = -1;
  private destroyStream = new Subject<void>();
  showInactive: any;
  filesString: string;

  ngOnInit() {
    this.dataSource = new CharterDataSource(this.charterService);
    this.dataSource.loadCharters(
      [],
      'subsidiaryName',
      'asc',
      0,
      this.defPageSize,
      false
    );
    this.dataSource
      .getLoadingState()
      .pipe(takeUntil(this.destroyStream))
      .subscribe(res => {
        if (res) {
          this.spinner.show();
        } else {
          this.spinner.hide();
        }
      });
  }

  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadChartersPage()))
      .subscribe();
  }

  loadChartersPage() {
    this.dataSource.loadCharters(
      this._filterValue,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      this.showInactive
    );
  }

  onApplyFilter(filterValue) {
    this._filterValue = filterValue;
    // console.log(this._filterValue);
    this.paginator.pageIndex = 0;
    this.loadChartersPage();
  }

  onMouseOver(index) {
    this.mouseOverIndex = index;
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }

  openDocument(doc) {
    if (!(doc.state === 0 || doc.state === 5 || doc.state === null))
      window.open(
        window.location.origin + '/#/audit/edit/' + doc._id,
        '_blank'
      );
  }

  showCharters() {
    this.showInactive = !this.showInactive;
    this.loadChartersPage();
  }

  uploadFiles(event) {
    this.documents = [];
    const files = event.target.files;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const that = this;
      reader.onload = () => {
        that.documents.push({
          base64Content: reader.result
            .toString()
            .replace('data:', '')
            .replace(/^.+,/, ''),
          fileName: file.name,
          documentType: 'CHARTER'
        });
      };
      reader.onerror = function() {
        console.log(reader.error);
      };
    });
  }

  submitFiles() {
    if (this.documents.length !== 0) {
      this.charterService.postCharter(this.documents).subscribe(() => {
        this.filesString = '';
        this.loadChartersPage();
      });
    } else {
      window.alert('Вы не выбрали файл!');
    }
  }
}
