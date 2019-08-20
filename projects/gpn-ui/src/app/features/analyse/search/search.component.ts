import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewChild, AfterViewInit, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { DocumentsSearchService } from '../documents.service';
import { DocumentInfo } from '@app/models/document-info';

@Component({
  selector: 'gpn-search',
  providers: [DocumentsSearchService],
  styleUrls: ['search.component.scss'],
  templateUrl: 'search.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DocumentsListComponent implements AfterViewInit, OnInit {

  constructor(private searchService: DocumentsSearchService, private changeDetectorRefs: ChangeDetectorRef) { }
  displayedColumns: string[] = ['filemtime', 'short_filename'];
  documTypes: Array<{str_id: string, name: string}>;
  data: DocumentInfo[] = [];
  expandedElement: DocumentInfo | null;
  _filterVlaue : Array<{name: string, value: any}>
  resultsLength = 0;
  isLoadingResults = true;

  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: false })
  sort: MatSort;

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.searchService.getSearchContracts(this._filterVlaue,
            this.sort.active, this.sort.direction, this.paginator.pageIndex);
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = 10;
          return data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        })
      ).subscribe(data => {
      this.data = data;
      this.changeDetectorRefs.detectChanges();
    });

    this.searchService.getDocumTypes().subscribe(value => this.documTypes = value);
  }

  onApplyFilter(filterVlaue : Array<{name: string, value: any}>) {
    this.isLoadingResults = true;
    this._filterVlaue = filterVlaue;
    this.searchService!.getSearchContracts(this._filterVlaue, this.sort.active, this.sort.direction, this.paginator.pageIndex).
    subscribe(data => {
      this.data = data;
      this.isLoadingResults = false;
      this.changeDetectorRefs.detectChanges();
    });
  }

}

export interface DocumentInfoSearchResults {
  items: DocumentInfo[];
  total_count: number;
}
