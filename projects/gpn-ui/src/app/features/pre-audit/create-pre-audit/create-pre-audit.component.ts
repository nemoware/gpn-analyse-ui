import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  AfterViewInit,
  Inject,
  OnDestroy
} from '@root/node_modules/@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup
} from '@root/node_modules/@angular/forms';
import { Subject, SubscriptionLike } from '@root/node_modules/rxjs';
import {
  DateAdapter,
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@root/node_modules/@angular/material';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { PreAuditService } from '@app/features/pre-audit/pre-audit.service';

@Component({
  selector: 'gpn-create-pre-audit',
  templateUrl: './create-pre-audit.component.html',
  styleUrls: ['./create-pre-audit.component.scss'],
  providers: [PreAuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePreAuditComponent
  implements OnInit, OnDestroy, AfterViewInit {
  faTimes = faTimes;
  subscriptions: SubscriptionLike[] = [];
  auditForm: FormGroup;
  private _onDestroy = new Subject<void>();
  checkTypes = ['InsiderControl', 'InterestControl'];
  documents: Object[] = [];
  filesString = '';

  public typeControl: FormControl = new FormControl(this.checkTypes);

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private preAuditService: PreAuditService,
    public dialogRef: MatDialogRef<CreatePreAuditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {},
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm() {
    this.auditForm = this.fb.group({});
  }

  ngOnInit() {}

  ngAfterViewInit(): void {}

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  CloseForm() {
    this.dialogRef.close();
  }

  valid(): boolean {
    return (
      !(this.filesString.length === 0) && this.typeControl.value.length > 0
    );
  }

  uploadFiles(event) {
    this.documents = [];
    const files = event.target.files;
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      const that = this;
      reader.onload = () => {
        that.documents.push({
          base64Content: reader.result
            .toString()
            .replace('data:', '')
            .replace(/^.+,/, ''),
          fileName: file.name
        });
      };
      reader.onerror = function() {
        console.log(reader.error);
      };
    });
  }

  submitFiles() {
    this.preAuditService
      .postPreAudit(this.documents, this.typeControl.value)
      .subscribe(() => {
        this.filesString = '';
        this.CloseForm();
      });
  }
}
