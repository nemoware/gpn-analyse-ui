import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DocumentsSearchService } from '../documents.service';

import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
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
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      )
    ])
  ]
})
export class DocumentsListComponent implements AfterViewInit {
  constructor(private searchService: DocumentsSearchService) {}

  displayedColumns: string[] = ['filemtime', 'short_filename'];

  data: DocumentInfo[] = [];
  expandedElement: DocumentInfo | null;

  resultsLength = 0;
  isLoadingResults = true;

  @ViewChild(MatPaginator, { static: false })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: false })
  sort: MatSort;

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.searchService.getSearchResults(
            'fake query',
            this.sort.active,
            this.sort.direction,
            this.paginator.pageIndex
          );
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = 10; // TODO: data.total_count;

          return data;
        }),

        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        })
      )
      .subscribe(data => (this.data = data));
  }
}

export interface DocumentInfoSearchResults {
  items: DocumentInfo[];
  total_count: number;
}
