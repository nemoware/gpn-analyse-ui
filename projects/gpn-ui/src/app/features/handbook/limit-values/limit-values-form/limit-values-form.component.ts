import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  NgZone,
  ViewChild,
  OnDestroy
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDatepickerInputEvent
} from '@root/node_modules/@angular/material';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@root/node_modules/@angular/forms';
import { CdkTextareaAutosize } from '@root/node_modules/@angular/cdk/text-field';
// tslint:disable-next-line:import-blacklist
import { take } from '@root/node_modules/rxjs/internal/operators';
import { HandBookService } from '@app/features/handbook/hand-book.service';
import { LimitValue, SubLimit } from '@app/models/limitValue.model';
import { Subject, Subscription } from '@root/node_modules/rxjs';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import createNumberMask from '@root/node_modules/text-mask-addons/dist/createNumberMask';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'gpn-limit-values-form',
  templateUrl: './limit-values-form.component.html',
  styleUrls: ['./limit-values-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LimitValuesFormComponent implements OnInit, OnDestroy {
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;

  subscriptions: Subscription[] = [];
  controlForm: FormGroup;
  faTrashAlt = faTrashAlt;
  mouseOverIndex = -1;
  numberMask: any;
  private destroyStream = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<LimitValuesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _ngZone: NgZone,
    private handBookService: HandBookService,
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    if (data.new) {
      this.controlForm = this.fb.group({
        startDate: ['', Validators.required],
        limits: this.fb.array([])
      });
      this.addLimitValue('0');
    } else {
      this.controlForm = this.fb.group({
        startDate: [data.limitValue.startDate, Validators.required],
        limits: this.fb.array([])
      });
      this.data.limitValue.limits.forEach(elem =>
        this.addLimitValue(elem.lowerLimit, elem.upperLimit, elem.limitValue)
      );
    }
  }

  ngOnInit() {
    this.numberMask = createNumberMask({
      prefix: '',
      thousandsSeparatorSymbol: ' '
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

  matDateChange(event: MatDatepickerInputEvent<unknown>) {
    // @ts-ignore
    const d = event.targetElement.value.replace('_', '0').split('.');
    this.controlForm.patchValue({
      startDate: new Date(Date.parse(d[1] + '.' + d[0] + '.' + d[2]))
    });
  }

  get limits() {
    return this.controlForm.get('limits') as FormArray;
  }

  getGroup(i): FormGroup {
    return this.limits.controls[i] as FormGroup;
  }

  addLimitValue(lowerLimit = '', upperLimit = '', limitValue = '') {
    const limit = this.fb.group({
      lowerLimit: [lowerLimit],
      upperLimit: [upperLimit],
      limitValue: [limitValue]
    });
    this.limits.push(limit);
    limit.controls['lowerLimit'].setValidators([
      Validators.pattern('^[0-9]+(\\.?[0-9]+)?$'),
      Validators.required
    ]);
    limit.controls['upperLimit'].setValidators([
      Validators.pattern('^[0-9]+(\\.?[0-9]+)?$')
    ]);
    limit.controls['limitValue'].setValidators([
      Validators.pattern('^[0-9]+(\\.?[0-9]+)?$'),
      Validators.required
    ]);
  }

  removeLimitValue(index: any, event: MouseEvent) {
    event.stopPropagation();
    if (index != null) {
      this.limits.removeAt(index);
    }
  }

  validateLimitValues(limitValue: LimitValue) {
    limitValue.limits.sort((a, b) => {
      if (a.lowerLimit === b.lowerLimit) {
        return 0;
      } else {
        return a.lowerLimit < b.lowerLimit ? -1 : 1;
      }
    });
    let prevLimitValue = 0;
    let prevUpperLimit = 0;
    for (const limit of limitValue.limits) {
      let upperLimit = limit.upperLimit;
      if (!upperLimit) {
        upperLimit = Number.MAX_VALUE;
        limit.upperLimit = null;
      }
      if (limit.lowerLimit >= upperLimit) {
        return 'Начало диапазона должно быть меньше конца диапазона';
      }
      if (limit.limitValue < prevLimitValue) {
        return 'Предельные значения должны увеличиваться с ростом балансовой стоимости';
      }
      if (limit.lowerLimit !== prevUpperLimit) {
        return 'Пропущен диапазон или к одному диапазону привязано более 1 предельного значения';
      }
      prevLimitValue = limit.limitValue;
      prevUpperLimit = upperLimit;
    }
  }

  saveLimitValue() {
    const newValues: LimitValue = {
      startDate: this.controlForm.controls.startDate.value,
      limits: (this.limits.controls as Array<FormGroup>).map(group => {
        return {
          lowerLimit: +group.controls['lowerLimit'].value,
          upperLimit: +group.controls['upperLimit'].value,
          limitValue: +group.controls['limitValue'].value
        };
      })
    };

    const error = this.validateLimitValues(newValues);
    if (error) {
      alert(error);
      return;
    }

    if (this.data.new) {
      this.subscriptions.push(
        this.handBookService
          .postLimitValue(newValues)
          .pipe(takeUntil(this.destroyStream))
          .subscribe(data => {
            this.dialogRef.close(data);
          })
      );
    } else {
      newValues._id = this.data.limitValue._id;
      this.subscriptions.push(
        this.handBookService
          .updateLimitValue(newValues)
          .pipe(takeUntil(this.destroyStream))
          .subscribe(data => {
            this.dialogRef.close(data);
          })
      );
    }
  }

  validateLimit(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const lowerLimitControl = group.controls['lowerLimit'];
      const upperLimitControl = group.controls['upperLimit'];
      if (+lowerLimitControl.value >= +upperLimitControl.value) {
        return { InvalidDiapason: true };
      }
      return;
    };
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
