import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { User } from '@app/models/user.model';
import { UserService } from '@app/features/admin/user.service';
import { MatDialog } from '@root/node_modules/@angular/material';
import { DialogRoleComponent } from '@app/features/admin/dialog.role/dialog.role.component';
import { strict } from 'assert';
import { DialogUserComponent } from '@app/features/admin/dialog.user/dialog.user.component';

@Component({
  selector: 'gpn-administration',
  providers: [UserService],
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministrationComponent implements OnInit {

  users: Array<User>;
  isNewRecord: boolean;
  statusMessage: string;
  permissions: Array<{id: number, name: string; description: string}>;

  constructor(private serv: UserService, private changeDetectorRefs: ChangeDetectorRef, public dialog: MatDialog) {
    this.users = new Array<User>();
  }

  openDialog(user: User): void {

    this.statusMessage = '';

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '550px',
      data: {
        permissions: this.permissions,
        user_role: user.roles
      }
    });

    dialogRef.afterClosed().subscribe( result => {
      if (result && result.length > 0) {
        this.serv.saveRoles(user.id, result).subscribe( value => {
          const roles = [];
          for (const r of result)
            if (r.status === 'save' || r.status === 'insert')
              roles.push(r.id);
          user.roles = roles;
          this.changeDetector('Прва доступа пользователя ' + user.login + ' успешно обновлены');
        });
      }
    });
  }

  getStrRole(roles: Array<number>) {
    if (!roles) return '';
    let str_role = '';
    if (this.permissions)
      for (const r of roles) {
        const role = this.permissions.find(s => s.id === Number(r));
      if (role) str_role = str_role ? str_role + ', ' + role.name : role.name;
    }
    return str_role;
  }

  ngOnInit() {
    this.getPermissions();
    this.getUsers();
  }

  private getPermissions() {
    this.serv.getPermissions().subscribe( value => { this.permissions = value; });
  }

  private getUsers() {
    this.serv.getUsers().subscribe( value => {
      this.users = value;
        this.changeDetectorRefs.detectChanges();
      },
      error => {
        alert(error.error.msg);
      }
    );
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
            const newUser = new User( 0, result.sAMAccountName, result.displayName, '', []);
            this.serv.createUser(newUser).subscribe(user => {
              newUser.id = user.id;
              this.users.push(newUser);
              this.changeDetector('Пользователь ' + newUser.login + ' успешно добавлен');
          });
        }
      }
    });
  }

  deleteUser(user: User) {
    if (confirm('Вы действительно хотите удалить данного пользователя?')) {
      this.serv.deleteUser(user.id.toString()).subscribe(data => {
        this.users = this.arrayRemove(this.users, user);
        this.changeDetector('Пользователь ' + user.login + ' успешно удален');
      });
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

}
