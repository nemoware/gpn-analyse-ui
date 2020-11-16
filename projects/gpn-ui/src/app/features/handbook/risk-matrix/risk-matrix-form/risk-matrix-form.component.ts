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

  listOfDocumentTypes = ['Договор', 'Устав', 'Протокол'];
  subscriptions: Subscription[] = [];

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
    'RealEstateTransactions'
  ];
  listOfViolations = [
    'charter_not_found',
    'protocol_not_found',
    'contract_value_great_than_protocol_value',
    'contract_value_not_equal_protocol_value',
    'contract_value_less_than_protocol_value',
    'contract_date_less_than_protocol_date',
    'provision_date_less_than_protocol_date',
    'hire_date_less_than_protocol_date',
    'charity_policy_date_less_than_protocol_date'
  ];
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
        riskControl: new FormControl(''),
        recommendationControl: new FormControl(''),
        disadvantageControl: new FormControl('')
      });
    } else {
      this.controlForm = new FormGroup({
        violationControl: new FormControl(data.risk.violation, [
          Validators.required
        ]),
        subjectControl: new FormControl(data.risk.subject),
        riskControl: new FormControl(data.risk.risk),
        recommendationControl: new FormControl(data.risk.recommendation),
        disadvantageControl: new FormControl(data.risk.disadvantage)
      });
    }
  }

  ngOnInit() {}

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
}
