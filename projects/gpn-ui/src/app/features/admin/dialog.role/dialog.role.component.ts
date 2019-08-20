import { Component, OnInit, ChangeDetectionStrategy, Inject, Input } from '@angular/core';
import { UserService } from '@app/features/admin/user.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@root/node_modules/@angular/material';

@Component({
  selector: 'gpn-administration',
  providers: [UserService],
  templateUrl: './dialog.role.component.html',
  styleUrls: ['./dialog.role.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogRoleComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<DialogRoleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      id: number,
      permissions: Array<{id: number, name: string; description: string}>,
      user_role: Array<string>
    }) {}
  ngOnInit() {
  }

  Apply()  {
    const list : Array<string> = [];
    for (const s of this.data.permissions) {
      const elem = document.getElementById('chk_' + s.name);
      if (elem && (elem as HTMLInputElement).checked) {
        list.push(s.id.toString());
      }
    }
    this.dialogRef.close(list);
  }

}
