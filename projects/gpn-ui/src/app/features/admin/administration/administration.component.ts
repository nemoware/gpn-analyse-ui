import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { GroupInfo } from '@app/models/group.model';
import {
  MatDialog,
  MatPaginator,
  MatSort,
  MatTableDataSource
} from '@root/node_modules/@angular/material';
import { UserService } from '@app/features/admin/user.service';
import { DialogRoleComponent } from '@app/features/admin/dialog.role/dialog.role.component';
import { RoleInfo } from '@app/models/role.model';
import { DialogUserComponent } from '@app/features/admin/dialog.user/dialog.user.component';
import {
  faSearch,
  faUserMinus,
  faUserPlus,
  faUserCog,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { SubscriptionLike } from '@root/node_modules/rxjs';

@Component({
  selector: 'gpn-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserService]
})
export class AdministrationComponent implements OnInit, OnDestroy {
  faSearch = faSearch;
  faUserMinus = faUserMinus;
  faUserPlus = faUserPlus;
  faUserCog = faUserCog;
  faCog = faCog;
  str_error =
    'При сохранении данных возникли ошибки! Для просмотра перейдите в журнал ошибок!';
  groups: Array<GroupInfo>;
  roles: Array<RoleInfo>;

  columns: string[] = ['id', 'cn', 'roleString'];
  selectedGroup: GroupInfo;
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
    public dialog: MatDialog
  ) {
    this.groups = new Array<GroupInfo>();
  }

  statusMessage: string;
  ngOnInit() {
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.getRoles();
    this.refreshData();
  }

  refreshData(filter: Array<{ name: string; value: string }> = null) {
    this.subscriptions.push(
      this.userservice.getGroupsApp(filter).subscribe(data => {
        this.groups = data.map(x => {
          x.roleString = x.roles
            .map(e => {
              return e.name;
            })
            .join(', ');
          return x;
        });
        this.selectedGroup = this.groups[0];
        this.refreshViewTable();
      })
    );
  }

  refreshViewTable(user: any = null) {
    this.count = this.groups.length;
    this.activePageDataChunk = this.groups.slice(0, this.pageSize);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
    if (user != null) {
      this.selectedGroup = user as GroupInfo;
    }
    this.changeDetectorRefs.detectChanges();
  }

  openDialogRoles(user: GroupInfo): void {
    this.statusMessage = '';
    const A = [];
    user.roles.forEach(x => A.push(Number(x._id)));
    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '500px',
      data: {
        roles: this.roles,
        user_role: A
      }
    });
    dialogRef.afterClosed().subscribe(roles => {
      if (roles) {
        const B: string[] = [];
        for (const role of roles) B.push(role._id.toString());
        if (!(JSON.stringify(A) === JSON.stringify(B))) {
          user.roles = roles;
          this.subscriptions.push(
            this.userservice.updateGroup(user._id, user).subscribe(data => {
              const u = this.groups.find(x => x._id === user._id);
              u.roleString = (data as GroupInfo).roles
                .map(e => e.name)
                .join(', ');
              this.refreshViewTable(u);
            })
          );
        }
      }
    });
  }

  private getRoles() {
    this.subscriptions.push(
      this.userservice.getRoles().subscribe(value => {
        this.roles = value;
      })
    );
  }

  addGroup() {
    this.statusMessage = '';
    const dialogRef = this.dialog.open(DialogUserComponent, {
      width: '30%',
      height: '100%'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.statusMessage = '';

        this.subscriptions.push(
          this.userservice
            .createGroup(result.cn, result.distinguishedName)
            .subscribe(
              group => {
                group.cn = result.cn;
                this.groups.push(group);
                this.refreshViewTable(group);
                this.changeDetector(
                  'Группа ' + group.cn + ' успешно добавлена!'
                );
              },
              error => {
                alert(this.str_error);
                this.changeDetector(this.str_error);
              }
            )
        );
      }
    });
  }

  deleteUser() {
    if (
      this.selectedGroup &&
      confirm(
        `Вы действительно хотите удалить сотрудника ${this.selectedGroup.cn} из списка пользователей?`
      )
    ) {
      this.subscriptions.push(
        this.userservice
          .deleteGroup(this.selectedGroup._id.toString())
          .subscribe(
            data => {
              this.groups = this.arrayRemove(this.groups, this.selectedGroup);
              this.refreshViewTable();
              this.changeDetector(
                'Пользователь ' + this.selectedGroup.cn + ' успешно удален'
              );
            },
            error => {
              alert(this.str_error);
              this.changeDetector(this.str_error);
            }
          )
      );
    }
  }

  changeDetector(message: string) {
    this.statusMessage = message;
    this.changeDetectorRefs.detectChanges();
  }

  arrayRemove(arr, value) {
    return arr.filter(function(ele) {
      return ele !== value;
    });
  }

  valueSearch(value: string) {
    const filterVlaue = new Array<{ name: string; value: string }>();
    if (value.length > 0) {
      filterVlaue.push({ name: 'filter', value: value });
    }
    this.refreshData(filterVlaue);
  }

  selectRow(row) {
    if (this.selectedGroup._id !== row._id) {
      this.selectedGroup = row;
    }
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

    this.activePageDataChunk = this.groups.slice(firstCut, secondCut);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }
}
