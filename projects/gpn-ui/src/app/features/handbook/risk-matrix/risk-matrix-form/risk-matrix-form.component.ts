import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  NgZone,
  ViewChild
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@root/node_modules/@angular/material';
import {
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
import { RiskMatrix } from '@app/models/riskMatrix.model';
import { Subscription } from '@root/node_modules/rxjs';

@Component({
  selector: 'gpn-risk-matrix-form',
  templateUrl: './risk-matrix-form.component.html',
  styleUrls: ['./risk-matrix-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskMatrixFormComponent implements OnInit {
  @ViewChild('autosize', { static: false }) autosize: CdkTextareaAutosize;

  listOfDocumentTypes = ['CONTRACT', 'CHARTER', 'PROTOCOL'];
  subscriptions: Subscription[] = [];
  risk: string = null;
  recommendation: string = null;
  disadvantage: string = null;
  violation: string = null;
  subject: string = null;
  listOfSubjects = [
    'AllDeals',
    'Charity',
    'Deal',
    'BigDeal',
    'DealGeneralBusiness',
    'DealIntellectualProperty',
    'InterestedPartyTransaction',
    'RelatedTransactions',
    'RelatedPartyTransaction',
    'AssetTransaction',
    'RealEstateTransaction',
    'RefusalToLeaseLand',
    'AgencyContract',
    'Service',
    'GeneralContract',
    'SecuritiesTransactions',
    'PledgeEncumbrance',
    'CashPayments',
    'Loans',
    'BankGuarantees',
    'DecisionsForSubsidiary',
    'Reorganization',
    'Liquidation',
    'RevisionCommission',
    'ParticipationInOtherOrganizations',
    'EmployeeContracts',
    'RegisteredCapital',
    'AssetTransactions',
    'RealEstateTransactions',
    'RealEstate'
  ];
  listOfViolations = [];
  //Форма контроля ввода
  controlForm: FormGroup;
  selectedType: string;

  constructor(
    private dialogRef: MatDialogRef<RiskMatrixFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _ngZone: NgZone,
    private handBookService: HandBookService
  ) {
    if (data.new) {
      this.controlForm = new FormGroup({
        violationControl: new FormControl('', [Validators.required]),
        subjectControl: new FormControl('AllDeals'),
        riskControl: new FormControl('', [this.ValidateRisk()]),
        recommendationControl: new FormControl('', [
          this.ValidateRecommendation()
        ]),
        disadvantageControl: new FormControl('', [this.ValidateDisadvantage()])
      });
    } else {
      this.controlForm = new FormGroup({
        violationControl: new FormControl(data.risk.violation, [
          Validators.required
        ]),
        subjectControl: new FormControl(data.risk.subject),
        riskControl: new FormControl(data.risk.risk + '\n', [
          this.ValidateRisk()
        ]),
        recommendationControl: new FormControl(
          data.risk.recommendation + '\n',
          [this.ValidateRecommendation()]
        ),
        disadvantageControl: new FormControl(data.risk.disadvantage + '\n', [
          this.ValidateDisadvantage()
        ])
      });
      if (data.risk.subject) {
        this.selectedType = 'CONTRACT';
      }
      this.risk = data.risk.risk;
      this.disadvantage = data.risk.disadvantage;
      this.recommendation = data.risk.recommendation;
      this.violation = data.risk.violation;
      this.subject = data.risk.subject;
    }
    this.controlForm.setValidators(this.uniqueValidator());
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

  addRisk() {
    const newRisk: RiskMatrix = {
      disadvantage: this.controlForm.controls.disadvantageControl.value
        .toString()
        .trim(),
      recommendation: this.controlForm.controls.recommendationControl.value
        .toString()
        .trim(),
      risk: this.controlForm.controls.riskControl.value.toString().trim(),
      subject: this.controlForm.controls.subjectControl.value.toString().trim(),
      violation: this.controlForm.controls.violationControl.value
        .toString()
        .trim()
    };
    if (this.selectedType !== 'CONTRACT') {
      newRisk.subject = '';
    }
    if (this.data.new) {
      this.subscriptions.push(
        this.handBookService.postRisk(newRisk).subscribe(
          data => {
            this.dialogRef.close(data);
          },
          error => {}
        )
      );
    } else {
      newRisk._id = this.data.risk._id;
      this.subscriptions.push(
        this.handBookService.updateRisk(newRisk).subscribe(
          data => {
            this.dialogRef.close(data);
          },
          error => {}
        )
      );
    }
  }

  ValidateRisk(): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      if (control.value === '') {
        return;
      }
      let flag = true;
      for (const array of this.data.dataSource) {
        if (
          control.value.trim() === array.risk &&
          control.value.trim() !== this.risk
        ) {
          flag = false;
        }
      }
      if (!flag) {
        return { RepeatedRisk: true };
      }
      return;
    };
  }

  ValidateRecommendation(): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      if (control.value === '') {
        return;
      }
      let flag = true;
      for (const array of this.data.dataSource) {
        if (
          control.value.trim() === array.recommendation &&
          control.value.trim() !== this.recommendation
        ) {
          flag = false;
        }
      }
      if (!flag) {
        return { RepeatedRecommendation: true };
      }
      return;
    };
  }

  ValidateDisadvantage(): ValidatorFn {
    return (control: FormControl): ValidationErrors => {
      if (control.value === '') {
        return;
      }
      let flag = true;
      for (const array of this.data.dataSource) {
        if (
          control.value.trim() === array.disadvantage.trim() &&
          control.value.trim() !== this.disadvantage
        ) {
          flag = false;
        }
      }
      if (!flag) {
        return { RepeatedDisadvantage: true };
      }
      return;
    };
  }

  public uniqueValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (
        group.controls['violationControl'].value != null &&
        group.controls['subjectControl'].value != null
      ) {
        const control1 = group.controls['violationControl'].value;
        const control2 = group.controls['subjectControl'].value;
        let flag = true;
        for (const array of this.data.dataSource) {
          if (
            control1 === array.violation &&
            control2 === array.subject &&
            !(control1 === this.violation && control2 === this.subject)
          ) {
            flag = false;
          }
        }
        if (!flag) {
          return { isError: true };
        }
        return;
      }
    };
  }
}
