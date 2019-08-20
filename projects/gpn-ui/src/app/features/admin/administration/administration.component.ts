import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { User } from '@app/models/user.model';
import { UserService } from '@app/features/admin/user.service';
import { MatDialog } from '@root/node_modules/@angular/material';
import { DialogRoleComponent } from '@app/features/admin/dialog.role/dialog.role.component';
import { strict } from 'assert';

@Component({
  selector: 'gpn-administration',
  providers: [UserService],
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdministrationComponent implements OnInit {

  @ViewChild('readOnlyTemplate', {static: false}) readOnlyTemplate: TemplateRef<any>;
  @ViewChild('editTemplate', {static: false}) editTemplate: TemplateRef<any>;

  editedUser: User;
  users: Array<User>;
  isNewRecord: boolean;
  statusMessage: string;
  permissions: Array<{id: number, name: string; description: string}>;

  constructor(private serv: UserService, private changeDetectorRefs: ChangeDetectorRef, public dialog: MatDialog) {
    this.users = new Array<User>();
  }

  openDialog(): void {

    const dialogRef = this.dialog.open(DialogRoleComponent, {
      width: '550px',
      data: {
        permissions: this.permissions,
        user_role: this.editedUser.roles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editedUser.roles = result;
        this.changeDetectorRefs.detectChanges();
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
    this.editedUser = new User( 0, '', '', '', []);
    this.users.push(this.editedUser);
    this.isNewRecord = true;
    this.changeDetectorRefs.detectChanges();
  }

  editUser(user: User) {
    this.statusMessage = '';
    this.editedUser = new User(user.id, user.login, user.name, user.description, user.roles);
  }

  loadTemplate(user: User) {
    if (this.editedUser && this.editedUser.id === user.id) {
      return this.editTemplate;
    } else {
      return this.readOnlyTemplate;
    }
  }

  saveUser() {
    if (this.isNewRecord) {
      this.serv.createUser(this.editedUser).subscribe(data => {
        this.statusMessage = 'Данные успешно добавлены';
          this.getUsers();
      });
      this.isNewRecord = false;
      this.editedUser = null;
    } else {
      this.serv.updateUser(this.editedUser.id, this.editedUser).subscribe(data => {
        this.statusMessage = 'Данные успешно обновлены';
          this.getUsers();
      });
      this.editedUser = null;
    }
  }

  cancel() {
    if (this.isNewRecord) {
      this.users.pop();
      this.isNewRecord = false;
    }
    this.editedUser = null;
  }

  deleteUser(user: User) {
    if (confirm('Вы действительно хотите удалить данного пользователя?')) {
      this.serv.deleteUser(user.id.toString()).subscribe(data => {
        this.statusMessage = 'Данные успешно удалены';
        this.getUsers();
      });
    }
  }

}
