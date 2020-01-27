import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
import { UserInfo } from '@app/models/user.model';
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
  faUserCog
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'gpn-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UserService]
})
export class AdministrationComponent implements OnInit {
  faSearch = faSearch;
  faUserMinus = faUserMinus;
  faUserPlus = faUserPlus;
  faUserCog = faUserCog;
  str_error =
    'При сохранении данных возникли ошибки! Для просмотра перейдите в журнал ошибок!';
  users: Array<UserInfo>;
  roles: Array<RoleInfo>;

  columns: string[] = ['id', 'login', 'name', 'roleString'];
  selectedUser: UserInfo;
  dataSource = new MatTableDataSource();
  activePageDataChunk = [];
  count = 0;
  pageIndex = 0;
  pageSize = 15;
  lowValue = 0;
  highValue = 15;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private userservice: UserService,
    private changeDetectorRefs: ChangeDetectorRef,
    public dialog: MatDialog
  ) {
    this.users = new Array<UserInfo>();
  }

  statusMessage: string;
  ngOnInit() {
    this.paginator._intl.itemsPerPageLabel = 'Кол-во на страницу: ';
    this.getRoles();
    this.refreshData();
  }

  refreshData(filter: Array<{ name: string; value: string }> = null) {
    this.userservice.getUsersApp(filter).subscribe(data => {
      this.users = data;
      this.selectedUser = this.users[0];
      this.refreshViewTable();
    });
  }

  refreshViewTable(user: any = null) {
    this.count = this.users.length;
    this.activePageDataChunk = this.users.slice(0, this.pageSize);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
    if (user != null) {
      this.selectedUser = user as UserInfo;
    }
    this.changeDetectorRefs.detectChanges();
  }

  openDialogRoles(user: UserInfo): void {
    this.statusMessage = '';
    const A = [];
    user.roles.forEach(x => A.push(x._id));
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
          this.userservice.updateUser(user._id, user).subscribe(data => {
            const u = this.users.find(x => x._id === user._id);
            u.roleString = (data as UserInfo).roleString;
            this.refreshViewTable(u);
          });
        }
      }
    });
  }

  private getRoles() {
    this.userservice.getRoles().subscribe(value => {
      this.roles = value;
    });
  }

  addUser() {
    this.statusMessage = '';
    const dialogRef = this.dialog.open(DialogUserComponent, {
      width: '550px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result) {
          this.statusMessage = '';

          this.userservice.createUser(result.sAMAccountName).subscribe(
            user => {
              user.name = result.displayName;
              this.users.push(user);
              this.refreshViewTable(user);
              this.changeDetector(
                'Пользователь ' + user.name + ' успешно добавлен!'
              );
            },
            error => {
              alert(this.str_error);
              this.changeDetector(this.str_error);
            }
          );
        }
      }
    });
  }

  deleteUser() {
    if (
      this.selectedUser &&
      confirm(
        `Вы действительно хотите удалить сотрудника ${this.selectedUser.name} из списка пользователей?`
      )
    ) {
      this.userservice.deleteUser(this.selectedUser._id.toString()).subscribe(
        data => {
          this.users = this.arrayRemove(this.users, this.selectedUser);
          this.refreshViewTable();
          this.changeDetector(
            'Пользователь ' + this.selectedUser.login + ' успешно удален'
          );
        },
        error => {
          alert(this.str_error);
          this.changeDetector(this.str_error);
        }
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
      filterVlaue.push({ name: 'value', value: value });
    }
    this.refreshData(filterVlaue);
  }

  selectRow(row) {
    if (this.selectedUser._id !== row._id) {
      this.selectedUser = row;
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

    this.activePageDataChunk = this.users.slice(firstCut, secondCut);
    this.dataSource = new MatTableDataSource(this.activePageDataChunk);
    this.dataSource.sort = this.sort;
  }
}
