import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Audit } from '@app/models/audit.model';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@root/node_modules/@angular/material';
import { Inject } from '@root/node_modules/@angular/core';

interface BookValue {
  year: string;
  value: string;
}

@Component({
  selector: 'gpn-subsidiary-detail',
  templateUrl: './subsidiary-detail.component.html',
  styleUrls: ['./subsidiary-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubsidiaryDetailComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SubsidiaryDetailComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      audit: Audit;
    }
  ) {}

  values: BookValue[] = [];

  ngOnInit() {
    for (const bookValue of this.data.audit.bookValues) {
      this.values.push({
        year: Object.keys(bookValue)[0],
        value: bookValue[Object.keys(bookValue)[0]]
      });
    }
  }
}
