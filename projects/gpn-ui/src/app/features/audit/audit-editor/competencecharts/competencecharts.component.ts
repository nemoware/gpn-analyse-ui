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

  constraintsTree = {}
  constraint_values: Array<Number> = []
  valuesRange = [0, 1]
  barOffsetPercent = 18


  constructor(private translate: TranslateService) { }

  ngAfterViewInit(): void { }


  getBarStyle(competenceKey, competence) {
    if (!('constraint-min' in competence))
      return `${competenceKey}-fade-left`;

    if (!('constraint-max' in competence))
      return `${competenceKey}-fade-right`;

    return `${competenceKey}-solid`;
  }



  getBarLeft(competence) {

    if ('constraint-min' in competence) {
      const range = this.valuesRange[1] - this.valuesRange[0]
      const percent_start = this.barOffsetPercent + (100.0 - this.barOffsetPercent * 2) * (competence['constraint-min'] - this.valuesRange[0]) / range;

      return percent_start
    }
    return 0
  }

  getBarWidth(competence) {
    const range = this.valuesRange[1] - this.valuesRange[0]

    if (('constraint-min' in competence) && ('constraint-max' in competence)) {

      const delta = competence['constraint-max'] - competence['constraint-min']
      return (100.0 - this.barOffsetPercent * 2) * delta / range;

    } else return this.barOffsetPercent
  }

  prepareData() {
    const constraintsTree = {}
    const constraint_values = []

    const toTree = x => {
      console.log(x);
      const pth: Array<string> =
        x.key.split('/')
          .map(x => x.replace(/[-_](\d){1,2}$/, '')); //trim number

      if (pth.length < 4) {
        console.log('sorry yeah?')
        console.log(x)
        return;
      }

      const org_level = pth[0]
      const competence_name = pth[1]
      const margin_ = pth[2]
      const margin_value = Number(x.value)

      if (!(org_level in constraintsTree)) {
        constraintsTree[org_level] = {}
      }
      const competences = constraintsTree[org_level]
      if (!(competence_name in competences)) {
        competences[competence_name] = {}
      }
      const competence = competences[competence_name]
      competence[margin_] = margin_value
      competence['span'] = x.span

      constraint_values.push(margin_value)

    }

    this.attributes
      .filter(x => x.kind === 'value') //TODO: mind currency
      .forEach(x => toTree(x));

    this.constraintsTree = constraintsTree
    this.constraint_values = constraint_values
    this.valuesRange = [Math.min.apply(null, this.constraint_values), Math.max.apply(null, this.constraint_values)]
  }

  ngOnInit() {
    console.log(this.attributes);
    this.prepareData()
  }

  scrollToSpan(span) {
    this.goToAttribute.emit('span_' + span[0]);
  }
}
