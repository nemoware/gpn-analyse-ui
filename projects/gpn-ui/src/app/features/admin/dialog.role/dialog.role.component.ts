import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  Input
} from '@angular/core';
import { UserService } from '@app/features/admin/user.service';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@root/node_modules/@angular/material';
import { RoleInfo } from '@app/models/role.model';

@Component({
  selector: 'gpn-diaog-role',
  providers: [UserService],
  templateUrl: './dialog.role.component.html',
  styleUrls: ['./dialog.role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogRoleComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogRoleComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      id: number;
      roles: Array<RoleInfo>;
      user_role: Array<string>;
    }
  ) {}

  ngOnInit() {
    this.data.user_role.forEach(x => this._selectedRole.push(x));
  }
  _selectedRole = [];

  Apply() {
    const listRoles: Array<RoleInfo> = [];
    for (const s of this.data.roles.filter(x =>
      this._selectedRole.includes(x._id)
    )) {
      listRoles.push({
        _id: s._id,
        name: s.name,
        description: s.description,
        appPage: s.appPage
      });
    }
    this.dialogRef.close(listRoles);
  }

  CloseForm() {
    this.dialogRef.close();
  }

  selectedRole(id) {
    return this._selectedRole.includes(id);
  }

  selectionChange(e) {
    if (this._selectedRole.includes(e.option._value))
      this._selectedRole = this._selectedRole.filter(
        x => x !== e.option._value
      );
    else this._selectedRole.push(e.option._value);
  }

  disabledRole(id) {
    if (this._selectedRole.includes('1') && id !== '1') return true;
    else
      return (
        !this._selectedRole.includes('1') &&
        this._selectedRole.length > 0 &&
        id === '1'
      );
  }
}
