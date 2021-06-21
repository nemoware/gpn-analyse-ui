import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Inject, NgZone, ViewChild } from '@root/node_modules/@angular/core';
import { CdkTextareaAutosize } from '@root/node_modules/@angular/cdk/text-field';
import { Subscription } from '@root/node_modules/rxjs';
import {
  FormControl,
  FormGroup,
  Validators
} from '@root/node_modules/@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDatepicker,
  MatDialogRef
} from '@root/node_modules/@angular/material';
import { HandBookService } from '@app/features/handbook/hand-book.service';

import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE
} from '@angular/material/core';
// @ts-ignore
import * as _moment from 'moment';
// @ts-ignore
import { default as _rollupMoment, Moment } from 'moment';
import { BookValue } from '@app/models/bookValue';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY'
  },
  display: {
    dateInput: 'MM.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'gpn-book-values-form',
  templateUrl: './book-values-form.component.html',
  styleUrls: ['./book-values-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class BookValuesFormComponent implements OnInit {
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;

  subscriptions: Subscription[] = [];
  //Форма контроля ввода
  controlForm: FormGroup;
  value: any;
  date;

  constructor(
    private dialogRef: MatDialogRef<BookValuesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _ngZone: NgZone,
    private handBookService: HandBookService
  ) {
    if (data.new) {
      this.controlForm = new FormGroup({
        valueControl: new FormControl('', [Validators.required])
      });
      this.date = new FormControl(moment(), [Validators.required]);
    } else {
      this.controlForm = new FormGroup({
        valueControl: new FormControl(data.bookValue.value, [
          Validators.required
        ])
      });
      this.date = new FormControl(data.bookValue.date, [Validators.required]);
    }
  }

  ngOnInit() {}

  CloseForm() {
    this.dialogRef.close();
  }

  addBookValue() {
    const newBookValue: BookValue = {
      date: this.date.value,
      value: this.controlForm.controls.valueControl.value
    };
    if (this.data.new) {
      this.subscriptions.push(
        this.handBookService.postBookValue(newBookValue).subscribe(data => {
          this.dialogRef.close(data);
        })
      );
    } else {
      newBookValue._id = this.data.bookValue._id;
      this.subscriptions.push(
        this.handBookService.updateBookValue(newBookValue).subscribe(data => {
          this.dialogRef.close(data);
        })
      );
    }
  }

  chosenYearHandler(event) {
    const ctrlValue = moment();
    ctrlValue.year(event._i.year);
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }
}
