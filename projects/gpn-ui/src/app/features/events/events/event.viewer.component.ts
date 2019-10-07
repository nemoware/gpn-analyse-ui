import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild
} from '@angular/core';

import { EventViewerService } from '@app/features/events/event.viewer.service';
import {
  MatPaginator,
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { EventApp } from '@app/models/event.model';

@Component({
  selector: 'gpn-event.viewer',
  templateUrl: './event.viewer.component.html',
  styleUrls: ['./event.viewer.component.scss'],
  providers: [EventViewerService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewerComponent implements OnInit, AfterViewInit {
  constructor(
    private eventviewerservice: EventViewerService,
    private changeDetectorRefs: ChangeDetectorRef
  ) {}
  isLoadingResults = true;
  eventsApp: EventApp[];
  resultsLength = 0;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource();
  activePageDataChunk = [];
  count = 0;
  pageIndex = 0;
  pageSize = 15;
  lowValue = 0;
  highValue = 15;
  _filterVlaue: Array<{ name: string; value: any }>;
  displayedColumns: string[] = ['date', 'login', 'name'];
  eventsType: Array<{ _id: string; name: string }>;

  ngOnInit() {
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.refreshData();
  }

  refreshData(filter: Array<{ name: string; value: string }> = null) {
    this.eventviewerservice.getEventsApp(filter).subscribe(data => {
      this.eventsApp = data;
      this.refreshViewTable();
    });
  }

  refreshViewTable() {
    this.count = this.eventsApp.length;
    this.activePageDataChunk = this.eventsApp.slice(0, this.pageSize);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
    this.changeDetectorRefs.detectChanges();
  }

  ngAfterViewInit() {
    this.refreshData();
    this.eventviewerservice
      .getEventsType()
      .subscribe(value => (this.eventsType = value));
  }

  onApplyFilter(filterVlaue: Array<{ name: string; value: any }>) {
    this.refreshData(filterVlaue);
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

    this.activePageDataChunk = this.eventsApp.slice(firstCut, secondCut);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
  }
}
