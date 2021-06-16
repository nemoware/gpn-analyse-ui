import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators
} from '@root/node_modules/@angular/forms';
import { Inject, NgZone, ViewChild } from '@root/node_modules/@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@root/node_modules/@angular/material';
import { AuditService } from '@app/features/audit/audit.service';
import { take } from '@root/node_modules/rxjs/operators';
import { HandBookService } from '@app/features/handbook/hand-book.service';
import { CdkTextareaAutosize } from '@root/node_modules/@angular/cdk/text-field';

@Component({
  selector: 'gpn-add-violation',
  templateUrl: './add-violation.component.html',
  styleUrls: ['./add-violation.component.scss'],
  providers: [AuditService, HandBookService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddViolationComponent implements OnInit {
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;

  risk: string = null;
  recommendation: string = null;
  disadvantage: string = null;
  subject: string = null;
  listOfViolations = [];
  attributes = [];
  //Форма контроля ввода
  controlForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<AddViolationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _ngZone: NgZone,
    private handBookService: HandBookService,
    private auditService: AuditService
  ) {
    if (data.new) {
      this.controlForm = new FormGroup({
        violationTypeControl: new FormControl('', [Validators.required]),
        violationTextControl: new FormControl(''),
        referenceControl: new FormControl(''),
        violationReasonControl: new FormControl('')
      });
    } else {
      this.controlForm = new FormGroup({
        violationTypeControl: new FormControl(data.violation.violation_type, [
          Validators.required
        ]),
        violationTextControl: new FormControl(data.violation.violation_text),
        referenceControl: new FormControl(data.violation.reference),
        violationReasonControl: new FormControl(
          data.violation.violation_reason_text
        )
      });
    }

    this.attributes = data.attributes;
  }

  ngOnInit() {
    //Получаем список всевозможных нарушений
    this.handBookService.getViolationTypes().subscribe(data => {
      this.listOfViolations = data;
    });
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  CloseForm() {
    this.dialogRef.close();
  }

  addViolation() {
    //shortcut
    const data = this.data;
    const auditId = data.document.auditId;
    if (data.new) {
      const violation_reason_text = this.controlForm.controls.violationReasonControl.value
        .toString()
        .trim();
      const newViolation = {
        document: {
          id: data.document.id,
          number: data.document.number,
          type: data.document.type
        },
        reference: this.controlForm.controls.referenceControl.value
          .toString()
          .trim(),
        violation_type: this.controlForm.controls.violationTypeControl.value
          .toString()
          .trim(),
        violation_text: this.controlForm.controls.violationTextControl.value
          .toString()
          .trim()
      };
      this.auditService
        .postViolation(
          newViolation,
          auditId,
          this.data.document.document_date,
          violation_reason_text
        )
        .subscribe(res => {
          this.dialogRef.close(res);
        });
    } else {
      const updatedViolation = {
        reference: this.controlForm.controls.referenceControl.value
          .toString()
          .trim(),
        violation_reason_text: this.controlForm.controls.violationReasonControl.value
          .toString()
          .trim(),
        violation_type: this.controlForm.controls.violationTypeControl.value
          .toString()
          .trim(),
        violation_text: this.controlForm.controls.violationTextControl.value
          .toString()
          .trim(),
        id: data.violation.id
      };
      this.auditService
        .updateViolation(updatedViolation, auditId)
        .subscribe(() => {
          this.dialogRef.close(true);
        });
    }
  }
}
