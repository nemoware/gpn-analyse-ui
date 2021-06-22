import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit
} from '@angular/core';
import { HandBookService } from '@app/features/handbook/hand-book.service';
import { takeUntil, tap } from '@root/node_modules/rxjs/operators';
import { merge, Subject } from '@root/node_modules/rxjs';
import { AffiliatesListDataSource } from '@app/features/handbook/affiliates-list/affiliates-list-data-source';
import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';
import { ViewChild } from '@root/node_modules/@angular/core';
import { MatPaginator, MatSort } from '@root/node_modules/@angular/material';
import { FilterPages } from '@app/models/filter.pages';

@Component({
  selector: 'gpn-affiliates-list-table',
  templateUrl: './affiliates-list-table.component.html',
  styleUrls: ['./affiliates-list-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AffiliatesListTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  filesString: string;
  documents: Object[] = [];
  dataSource: AffiliatesListDataSource;
  defPageSize = 15;
  private destroyStream = new Subject<void>();
  _filterValue: [];
  mouseOverIndex: number;
  columns: string[] = ['name', 'reasons', 'share'];
  filterPage = FilterPages;
  constructor(
    private handBookService: HandBookService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.dataSource = new AffiliatesListDataSource(this.handBookService);
    this.dataSource.loadAffiliates([], 'name', 'asc', 0, this.defPageSize);
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
      .pipe(tap(() => this.loadAffiliatesPage()))
      .subscribe();
  }

  loadAffiliatesPage() {
    this.dataSource.loadAffiliates(
      this._filterValue,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
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
          documentType: 'PDF'
        });
      };
      reader.onerror = function() {
        console.log(reader.error);
      };
    });
  }

  submitFiles() {
    if (this.documents.length !== 0) {
      this.spinner.show();
      this.handBookService
        .postAffiliatesList(this.documents[0])
        .subscribe(() => {
          this.filesString = '';
          this.loadAffiliatesPage();
        });
    } else {
      window.alert('Вы не выбрали файл!');
    }
  }

  onApplyFilter(filterValue) {
    this._filterValue = filterValue;
    this.paginator.pageIndex = 0;
    this.loadAffiliatesPage();
  }
}
