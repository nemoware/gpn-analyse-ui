import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  Input,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { UserService } from '@app/features/admin/user.service';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatPaginator,
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { Observable, SubscriptionLike } from '@root/node_modules/rxjs';
import { faSearch, faPlusSquare } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'gpn-dialog-user',
  providers: [UserService],
  templateUrl: './dialog.user.component.html',
  styleUrls: ['./dialog.user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogUserComponent implements OnInit, OnDestroy {
  faSearch = faSearch;
  faPlusSquare = faPlusSquare;
  users: Array<{ sAMAccountName: string; displayName: string }>;
  columns: string[] = ['cn'];

  dataSource = new MatTableDataSource();
  activePageDataChunk = [];
  count = 0;
  pageIndex = 0;
  pageSize = 15;
  lowValue = 0;
  highValue = 15;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  subscriptions: SubscriptionLike[] = [];

  constructor(
    private userservice: UserService,
    private changeDetectorRefs: ChangeDetectorRef,
    public dialogRef: MatDialogRef<DialogUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {}
  ) {}

  ngOnInit() {
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.refreshData();
  }

  refreshData(filter: Array<{ name: string; value: string }> = null) {
    this.subscriptions.push(
      this.userservice.getADGroup(filter).subscribe(data => {
        this.users = data;
        this.refreshViewTable();
      })
    );
  }

  refreshViewTable() {
    this.count = this.users.length;
    this.activePageDataChunk = this.users.slice(0, this.pageSize);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
    this.changeDetectorRefs.detectChanges();
  }

  Apply(user: any) {
    this.dialogRef.close(user);
  }

  Close() {
    this.dialogRef.close();
  }

  valueSearch(value: string) {
    const filterVlaue = new Array<{ name: string; value: string }>();
    if (value.length > 0) {
      filterVlaue.push({ name: 'value', value: value });
    }
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

    this.activePageDataChunk = this.users.slice(firstCut, secondCut);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
