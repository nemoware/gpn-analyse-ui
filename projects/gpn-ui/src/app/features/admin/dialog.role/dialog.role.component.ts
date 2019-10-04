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

  ngOnInit() {}

  Apply() {
    const listRoles: Array<RoleInfo> = [];
    for (const s of this.data.roles) {
      const elem = document.getElementById('chk_' + s._id);
      if (elem && (elem as HTMLInputElement).checked) {
        listRoles.push({
          _id: s._id,
          name: s.name,
          description: s.description,
          appPage: s.appPage
        });
      }
    }
    this.dialogRef.close(listRoles);
  }

  CloseForm() {
    this.dialogRef.close();
  }
}
