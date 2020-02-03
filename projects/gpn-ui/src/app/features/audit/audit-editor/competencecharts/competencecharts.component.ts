import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  AfterViewInit,
  Output,
  EventEmitter
} from '@angular/core';
import { AttributeModel } from '@app/models/attribute-model';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';

@Component({
  selector: 'gpn-competencecharts',
  templateUrl: './competencecharts.component.html',
  styleUrls: ['./competencecharts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompetencechartsComponent implements OnInit, AfterViewInit {
  @Input() attributes: Array<AttributeModel>;
  @Output() goToAttribute = new EventEmitter<string>();

  constraintsTree = {};
  constraint_values: Array<Number> = [];
  valuesRange = [0, 1];
  barOffsetPercent = 18;

  constructor(private translate: TranslateService) {}

  ngAfterViewInit(): void {}

  getBarStyle(competenceKey, competence) {
    if (!('constraint-max' in competence)) return `${competenceKey}-fade-right`;
    if (!('constraint-min' in competence)) return `${competenceKey}-fade-left`;

    return `${competenceKey}-solid`;
  }

  getBarLeft(competence) {
    if ('constraint-min' in competence) {
      const range = this.valuesRange[1] - this.valuesRange[0];
      const percent_start =
        this.barOffsetPercent +
        ((100.0 - this.barOffsetPercent * 2) *
          (competence['constraint-min'] - this.valuesRange[0])) /
          range;

      return percent_start;
    }
    return 0;
  }

  getBarWidth(competence) {
    const range = this.valuesRange[1] - this.valuesRange[0];

    if (
      !('constraint-min' in competence) &&
      !('constraint-max' in competence)
    ) {
      return 100.0 - this.barOffsetPercent * 2; //whole width
    }

    if ('constraint-min' in competence && 'constraint-max' in competence) {
      const delta = competence['constraint-max'] - competence['constraint-min'];
      return ((100.0 - this.barOffsetPercent * 2) * delta) / range;
    } else return this.barOffsetPercent;
  }

  prepareData() {
    const constraintsTree = {};
    const constraint_values = [];

    const keyToPieces = key => {
      const pth: Array<string> = key
        .split('/')
        .map(y => y.replace(/[-_](\d){1,2}$/, '')); //trim number
      return pth;
    };

    const toTree = xx => {
      console.log(xx);

      for (const x of xx) {
        const pth = keyToPieces(x.key);

        const org_level = pth[0];
        const competence_name = pth[1];

        if (!(org_level in constraintsTree)) {
          constraintsTree[org_level] = {};
        }
        const competences = constraintsTree[org_level];
        if (!(competence_name in competences)) {
          competences[competence_name] = {};
        }
        const competence = competences[competence_name];
        competence['span'] = x.span;
        if ((pth.length = 4)) {
          const margin_ = pth[2];
          if ('value' === x.kind) {
            const margin_value = Number(x.value);
            competence[margin_] = margin_value;
            constraint_values.push(margin_value);
          } else if ('currency' === x.kind) {
            competence['currency'] = x.value;
          }
        }
      }
    };

    const isConstraint = x => {
      const p = x.kind;
      return p === 'constraint-min' || p === 'constraint-max';
    };

    const collectChildrenOf = parent => {
      return this.attributes.filter(x => x.parent === parent.key);
    };

    const constraints = this.attributes.filter(isConstraint);

    for (const c of constraints) {
      console.log(c);
      const children = collectChildrenOf(c);
      toTree(children);
    }

    //TODO: get rid of this list, this is very temporal solution
    const deal_kinds = [
      /*'Deal',
      'BigDeal',
      'Charity',
      'Lawsuit',
      'RealEstate',
      'LoansLoans',
      'Insurance',
      'Consulting',
      'RentingOutRentingOut',
      'Renting'*/
      // temporal labels
      'AgencyContract',
      'Renting',
      'BankGuarantees',
      'Charity',
      'RelatedTransactions',
      'GeneralContract',
      'EmployeeContracts',
      'Loans',
      'PledgeEncumbrance',
      'BigDeal',
      'Liquidation',
      'Service',
      'CashPayments',
      'RefusalToLeaseLand',
      'Deal',
      'RevisionCommission',
      'Reorganization',
      'InterestedPartyTransaction',
      'RelatedPartyTransaction',
      'AssetTransactions',
      'RealEstate',
      'DealIntellectualProperty',
      'RealEstateTransactions',
      'SecuritiesTransactions',
      'Insurance',
      'RegisteredCapital',
      'ParticipationInOtherOrganizations',
      'DecisionsForSubsidiary'
    ];
    this.attributes
      .filter(a => deal_kinds.includes(a.kind))
      .forEach(a => toTree([a])); //TODO: fix it

    this.constraintsTree = constraintsTree;
    this.constraint_values = constraint_values;
    this.valuesRange = [
      Math.min.apply(null, this.constraint_values),
      Math.max.apply(null, this.constraint_values)
    ];
  }

  ngOnInit() {
    console.log(this.attributes);
    this.prepareData();
  }

  scrollToSpan(span) {
    this.goToAttribute.emit('span_' + span[0]);
  }

  public refreshData(attributes) {
    this.attributes = attributes;
    this.prepareData();
  }
}
