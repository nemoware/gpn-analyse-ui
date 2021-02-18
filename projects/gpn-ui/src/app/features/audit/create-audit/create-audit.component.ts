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
  MatDatepickerInputEvent,
  MatDialogRef,
  MatSelect
} from '@root/node_modules/@angular/material';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators
} from '@root/node_modules/@angular/forms';
import { ReplaySubject, Subject, SubscriptionLike } from 'rxjs';
import { environment as env } from '@environments/environment';
import { take, takeUntil } from 'rxjs/operators';
import { Subsidiary } from '@app/models/subsidiary.model';
import { Audit } from '@app/models/audit.model';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import createNumberMask from '@root/node_modules/text-mask-addons/dist/createNumberMask';

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
  public charterCtrl: FormControl = new FormControl();
  public subsidiaryFilterCtrl: FormControl = new FormControl();
  public filteredSubsidiaries: ReplaySubject<Subsidiary[]> = new ReplaySubject<
    Subsidiary[]
  >(1);
  @ViewChild('selectSubsidiary', { static: false }) selectSubsidiary: MatSelect;
  @ViewChild('selectCharters', { static: false }) selectCharters: MatSelect;
  selectedCharters = [];
  selectedSubsidiary;
  charters = [];
  subscriptions: SubscriptionLike[] = [];
  auditForm: FormGroup;
  errorMatcher = new CrossFieldErrorMatcher();
  private subsidiaries: Subsidiary[];
  private _onDestroy = new Subject<void>();
  _auditStart: Date = null;
  _auditEnd: Date = null;
  _ftpUrl: string = null;
  allSubs = { name: '* Все ДО' };
  years = [];
  numberMask;
  robotState: boolean;
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
        auditEnd: Date,
        bookValues: this.fb.array([])
      },
      {
        validator: this.dateValidator
      }
    );
  }

  get bookValues() {
    return this.auditForm.get('bookValues') as FormArray;
  }

  addBookValue() {
    this.bookValues.push(this.fb.control('', [Validators.required]));
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
    this.numberMask = createNumberMask({
      prefix: '',
      thousandsSeparatorSymbol: ' ',
      allowDecimal: true
    });
    this.robotState = env.robotState;
  }

  ngAfterViewInit(): void {
    this.auditservice.getSubsidiaries().subscribe(data => {
      this.subsidiaries = data;
      this.subsidiaries.unshift(this.allSubs);

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
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        this.selectSubsidiary.compareWith = (a: Subsidiary, b: Subsidiary) =>
          a.name === b.name;
      });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
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
    const values = [];
    for (let i = 0; i < this.years.length; i++) {
      const bookValue = {};
      bookValue[this.years[i]] = this.bookValues.value[i];
      values.push(bookValue);
    }

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
      author: null,
      charters: this.selectedCharters,
      bookValues: values
    };

    this.subscriptions.push(
      this.auditservice.postAudit(newAudit).subscribe(
        data => {
          this.dialogRef.close(data);
        },
        error => {}
      )
    );
  }

  valid(): boolean {
    // console.log(this.bookValues);
    let bookValueValidator = true;
    this.bookValues.controls.forEach(control => {
      if (!control.value) bookValueValidator = false;
    });
    if (this.robotState) {
      return (
        this._auditEnd != null &&
        this._auditStart != null &&
        this.subsidiaryCtrl.value != null &&
        this._auditStart <= this._auditEnd &&
        bookValueValidator
      );
    } else
      return (
        this._ftpUrl != null &&
        this._ftpUrl.toString().length > 0 &&
        this._auditEnd != null &&
        this._auditStart != null &&
        this.subsidiaryCtrl.value != null &&
        this._auditStart <= this._auditEnd &&
        bookValueValidator
      );
  }

  changeSubsidiary(e) {
    if (e) {
      this.selectedSubsidiary = e.value;
      this.selectedCharters = [];
      this.selectCharters.writeValue(null);
      this.charters = [];
      this.subscriptions.push(
        this.auditservice
          .getCharter(e.value.id !== this.allSubs.name ? e.value.id : null)
          .pipe(takeUntil(this._onDestroy))
          .subscribe(data => {
            this.charters = data;
          })
      );
    }
  }

  matDateChange(event: MatDatepickerInputEvent<unknown>) {
    // @ts-ignore
    const d = event.targetElement.value.replace('_', '0').split('.');
    if (event.targetElement.id === '_auditStart')
      this._auditStart = new Date(Date.parse(d[1] + '.' + d[0] + '.' + d[2]));
    else this._auditEnd = new Date(Date.parse(d[1] + '.' + d[0] + '.' + d[2]));

    if (
      this._auditStart != null &&
      this._auditEnd != null &&
      this._auditStart < this._auditEnd
    ) {
      const startYear = this._auditStart.getFullYear() - 1;
      const endYear = this._auditEnd.getFullYear() - 1;
      this.years = [];
      this.bookValues.clear();
      for (let i = startYear; i <= endYear; i++) {
        this.years.push(i);
        this.addBookValue();
      }
    }
  }
}
