import { Component, OnInit, ChangeDetectionStrategy, Inject, Input } from '@angular/core';
import { UserService } from '@app/features/admin/user.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@root/node_modules/@angular/material';
import { Observable } from '@root/node_modules/rxjs';

@Component({
  selector: 'gpn-dialog-user',
  providers: [UserService],
  templateUrl: './dialog.user.component.html',
  styleUrls: ['./dialog.user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DialogUserComponent implements OnInit {

  Users$ : Observable<any>;

  constructor(private serv: UserService,
    public dialogRef: MatDialogRef<DialogUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      id: number,
      permissions: Array<{id: number, name: string; description: string}>,
      user_role: Array<string>
    }) {}

  ngOnInit() {
    this.Users$ = this.serv.getUsersGroup();
  }

  Apply(user: any)  {
    this.dialogRef.close(user);
  }

  Close()  {
    this.dialogRef.close();
  }

}
