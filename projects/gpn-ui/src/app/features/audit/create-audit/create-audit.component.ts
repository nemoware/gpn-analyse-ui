import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { AuditService } from '@app/features/audit/audit.service';
import {
  DateAdapter,
  ErrorStateMatcher,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSelect
} from '@root/node_modules/@angular/material';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm
} from '@root/node_modules/@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';

import { take, takeUntil } from 'rxjs/operators';
import { Subsidiary } from '@app/models/subsidiary.model';
import { Audit } from '@app/models/audit.model';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

class CrossFieldErrorMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return control.dirty && form.invalid;
  }
}

@Component({
  selector: 'gpn-create-audit',
  templateUrl: './create-audit.component.html',
  styleUrls: ['./create-audit.component.scss'],
  providers: [AuditService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateAuditComponent implements OnInit, OnDestroy, AfterViewInit {
  faTimes = faTimes;
  public subsidiaryCtrl: FormControl = new FormControl();
  public subsidiaryFilterCtrl: FormControl = new FormControl();
  public filteredSubsidiaries: ReplaySubject<Subsidiary[]> = new ReplaySubject<
    Subsidiary[]
  >(1);
  @ViewChild('selectSubsidiary', { static: false }) selectSubsidiary: MatSelect;

  auditForm: FormGroup;
  errorMatcher = new CrossFieldErrorMatcher();
  private subsidiaries: Subsidiary[];
  private _onDestroy = new Subject<void>();
  _auditStart: Date = null;
  _auditEnd: Date = null;
  _ftpUrl: string = null;

  constructor(
    private dateAdapter: DateAdapter<Date>,
    private auditservice: AuditService,
    public dialogRef: MatDialogRef<CreateAuditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {},
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  initForm() {
    this.auditForm = this.fb.group(
      {
        auditStart: Date,
        auditEnd: Date
      },
      {
        validator: this.dateValidator
      }
    );
  }

  dateValidator(form: FormGroup) {
    const condition =
      form.get('auditStart').value != null &&
      form.get('auditEnd').value != null &&
      form.get('auditStart').value > form.get('auditEnd').value;
    return condition ? { invalidDate: true } : null;
  }

  ngOnInit() {
    this.dateAdapter.getFirstDayOfWeek = () => {
      return 1;
    };
  }

  ngAfterViewInit(): void {
    this.auditservice.getSubsidiaries().subscribe(data => {
      this.subsidiaries = data;
      this.filteredSubsidiaries.next(this.subsidiaries.slice());
      this.subsidiaryFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterSubsidiaries();
        });
      this.setInitialValue();
    });
  }

  private setInitialValue() {
    this.filteredSubsidiaries
      .pipe(
        take(1),
        takeUntil(this._onDestroy)
      )
      .subscribe(() => {
        this.selectSubsidiary.compareWith = (a: Subsidiary, b: Subsidiary) =>
          a._id === b._id;
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterSubsidiaries() {
    if (!this.subsidiaries) {
      return;
    }
    let search = this.subsidiaryFilterCtrl.value;
    if (!search) {
      this.filteredSubsidiaries.next(this.subsidiaries.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredSubsidiaries.next(
      this.subsidiaries.filter(
        subsidiary => subsidiary.name.toLowerCase().indexOf(search) > -1
      )
    );
  }

  CloseForm() {
    this.dialogRef.close();
  }

  CreateAudit() {
    const newAudit: Audit = {
      subsidiaryName: this.subsidiaryCtrl.value.name,
      subsidiary: this.subsidiaryCtrl.value,
      ftpUrl: this._ftpUrl,
      auditStart: this._auditStart,
      auditEnd: this._auditEnd,
      checkedDocumentCount: null,
      // @ts-ignore
      statuses: [],
      // @ts-ignore
      comments: [],
      createDate: new Date(),
      author: null
    };

    this.auditservice.postAudit(newAudit).subscribe(
      data => {
        this.dialogRef.close(data);
      },
      error => {}
    );
  }

  valid(): boolean {
    return (
      this._ftpUrl != null &&
      this._ftpUrl.toString().length > 0 &&
      this._auditEnd != null &&
      this._auditStart != null &&
      this.subsidiaryCtrl.value != null &&
      this._auditStart <= this._auditEnd
    );
  }
}
