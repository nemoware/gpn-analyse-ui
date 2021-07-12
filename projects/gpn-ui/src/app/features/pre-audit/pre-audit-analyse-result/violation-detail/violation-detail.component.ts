import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Input, OnDestroy, ViewChild } from '@root/node_modules/@angular/core';
import { MatSort } from '@root/node_modules/@angular/material/sort';
import { MatTableDataSource } from '@root/node_modules/@angular/material/table';
import { Subject } from '@root/node_modules/rxjs';

@Component({
  selector: 'gpn-violation-detail',
  templateUrl: './violation-detail.component.html',
  styleUrls: ['./violation-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViolationDetailComponent implements OnInit, OnDestroy {
  @Input() documents: any;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  header: string;
  col: string[] = ['violation', 'violation_reason', 'note'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  documentType: any;
  documentTypeName = null;
  focusedId: string;
  private destroyStream = new Subject<void>();

  constructor() {}

  ngOnInit() {
    const docs = this.documents.docs; // shortcut
    this.documentTypeName = null;
    if (docs && docs.length > 0) {
      this.dataSource.sort = this.sort;
      this.dataSource.data = docs;
    } else {
      // no docs
      this.dataSource.data = [];
    }
  }

  openDocument(element) {
    window.open(
      window.location.origin + '/#/audit/edit/' + element._id,
      '_blank'
    );
  }

  focusedDoc(id) {
    this.focusedId = id;
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
