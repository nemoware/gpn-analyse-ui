import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@root/node_modules/@angular/material';

@Component({
  selector: 'gpn-create-charter',
  templateUrl: './create-charter.component.html',
  styleUrls: ['./create-charter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateCharterComponent implements OnInit {
  _ftpUrl: string = null;

  constructor(public dialogRef: MatDialogRef<CreateCharterComponent>) {}

  ngOnInit() {}

  ngAfterViewInit(): void {}

  CloseForm() {
    this.dialogRef.close();
  }

  uploadCharter() {}
}
