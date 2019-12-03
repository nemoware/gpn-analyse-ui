import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  AfterViewInit,
  Output,
  EventEmitter
} from '@angular/core';
import * as Highcharts from 'highcharts';
import addMore from 'highcharts/highcharts-more';
import { AttributeModel } from '@app/models/attribute-model';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
addMore(Highcharts);

@Component({
  selector: 'gpn-competencecharts',
  templateUrl: './competencecharts.component.html',
  styleUrls: ['./competencecharts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompetencechartsComponent implements OnInit, AfterViewInit {
  @Input() attributes: Array<AttributeModel>;
  @Output() goToAttribute = new EventEmitter<string>();

  highcharts = Highcharts;
  colorSeries = [
    { name: 'Finance', color: '#D7BDE2', colorPlotLines: '#9B59B6' },
    { name: 'Deal', color: '#A9CCE3', colorPlotLines: '#2980B9' },
    { name: 'Court', color: '#A3E4D7', colorPlotLines: '#1ABC9C' },
    { name: 'RealEstate', color: '#D6DBDF', colorPlotLines: '#99A3A4' },
    { name: 'Lawsuit', color: '#FDEBD0', colorPlotLines: '#F5B041' },
    { name: 'Consulting', color: '#F6DDCC', colorPlotLines: '#F8C471' },
    { name: 'Other', color: '#D7DBDD', colorPlotLines: '#A6ACAF' }
  ];

  constructor(private translate: TranslateService) {}

  chartOptions = {
    chart: {
      type: 'columnrange',
      inverted: true,
      animation: false
    },
    title: {
      text: 'Компетенция',
      style: {
        display: 'none'
      }
    },
    xAxis: {
      categories: [],
      min: 0,
      labels: {
        format: '<span><b>{value}</b></span>'
      },
      plotLines: []
    },
    yAxis: {
      title: {
        text: 'Сумма (руб.)'
      },
      plotLines: []
    },
    tooltip: {
      enabled: false,
      borderColor: 'black',
      headerFormat: '<span style = "font-size:10px"><b>{point.key}</b></span>',
      pointFormat: `<table>
    <tr>
        <td style = "padding:0">{series.name}: </td>
        <td style = "padding:0"><b>{point.labeltooltip}</b></td>        
    </tr>
</table>`,
      footerFormat: '',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      series: {
        animation: false
      },
      columnrange: {
        dataLabels: {
          enabled: true,
          formatter: function() {
            if (this.point.labellow && this.y === this.point.low)
              return this.point.labellow;
            else if (this.point.labelhigh && this.y === this.point.high)
              return this.point.labelhigh;
            return this.y / 1000 + ' тыс.';
          }
        }
      }
    },
    credits: {
      enabled: false
    },
    series: []
  };

  ngAfterViewInit(): void {}

  getRoot(key: string) {
    const atr = this.attributes.find(x => x.key === key);
    if (!atr.parent) return this.getRoot(atr.parent);
    else return atr;
  }

  ngOnInit() {
    console.log(this.attributes);
    const constraints = this.attributes.filter(
      x =>
        ['constraint-min', 'constraint-max'].includes(x.kind) && x.num == null
    );
    const series: any[] = [];
    const category: any[] = [];
    console.log(constraints);
    const values = [];
    this.attributes
      .filter(x => x.kind === 'value')
      .forEach(x => values.push(Number(x.value)));
    //const delta = (Math.max.apply(null, values) + Math.min.apply(null, values)) / 2;
    const delta = Math.min.apply(null, values) / 2;
    console.log(delta);
    for (const c of constraints) {
      const rootAtr = this.attributes.find(
        x => x.key === c.parent.split('/')[0]
      );
      const seriaAtr = this.attributes.find(x => x.key === c.parent);

      let newSerie = series.find(s => s.kind === seriaAtr.kind);
      if (!newSerie) {
        const events = {
          show: function(chart) {
            if (chart.target.userOptions.plotLines)
              for (const line of chart.target.userOptions.plotLines)
                chart.target.chart.yAxis[0].addPlotLine(line);
          },
          hide: function(chart) {
            chart.target.chart.yAxis[0].removePlotLine(seriaAtr.kind);
          },
          click: function(e) {
            document.getElementById('highcharts_div').innerHTML =
              e.point.keylow != null ? e.point.keylow : e.point.keyhigh;
            document.getElementById('highcharts_div').click();
          }
        };

        newSerie = {
          key: seriaAtr.key,
          color: this.colorSeries.find(x => x.name === seriaAtr.kind).color,
          name: this.translate.instant(seriaAtr.kind),
          kind: seriaAtr.kind,
          data: [],
          events: events,
          plotLines: []
        };
        series.push(newSerie);
      }

      if (!category.find(x => x.kind === rootAtr.kind))
        category.push({
          key: rootAtr.key,
          kind: rootAtr.kind,
          name: this.translate.instant(rootAtr.kind)
        });
    }

    for (const s of series) {
      const colorSerie = this.colorSeries.find(x => x.name === s.kind);

      for (const c of category) {
        const lowSum = constraints.find(
          x =>
            x.kind === 'constraint-min' &&
            x.parent.includes(c.kind) &&
            x.parent.includes(s.kind)
        );
        const highSum = constraints.find(
          x =>
            x.kind === 'constraint-max' &&
            x.parent.includes(c.kind) &&
            x.parent.includes(s.kind)
        );

        const range = {
          keylow: null,
          keyhigh: null,
          labellow: null,
          labelhigh: null,
          labeltooltip: null,
          low: null,
          high: null,
          color: null
        };

        if (lowSum || highSum) {
          if (lowSum) {
            const currency = this.attributes.find(
              x => x.key === lowSum.key + '/currency'
            );
            const sign = this.attributes.find(
              x => x.key === lowSum.key + '/sign'
            );
            const value = this.attributes.find(
              x => x.key === lowSum.key + '/value'
            );
            range.labellow = value.value + ' ' + currency.value;
            range.labeltooltip = value.value + ' ' + currency.value + ' - ';
            range.low = value.value;
            range.keylow = value.key;

            if (
              !s.plotLines.find(x => x.value === value.value) &&
              Number(value.value) !== 0
            ) {
              s.plotLines.push({
                value: value.value,
                color: colorSerie.colorPlotLines,
                width: 2,
                id: colorSerie.name,
                dashStyle: 'dash'
              });
            }
          } else {
            range.labellow = 'Не определено';
            range.low = 0;
            range.labeltooltip = 'Не определено - ';
            range.color = {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, colorSerie.color],
                [1, 'white']
              ]
            };
          }

          if (highSum) {
            const currency = this.attributes.find(
              x => x.key === highSum.key + '/currency'
            );
            const sign = this.attributes.find(
              x => x.key === highSum.key + '/sign'
            );
            const value = this.attributes.find(
              x => x.key === highSum.key + '/value'
            );
            range.labelhigh = value.value + ' ' + currency.value;
            range.labeltooltip += value.value + ' ' + currency.value;
            range.high = value.value;
            range.keyhigh = value.key;
            if (!s.plotLines.find(x => x.value === value.value)) {
              s.plotLines.push({
                value: value.value,
                color: colorSerie.colorPlotLines,
                width: 2,
                id: colorSerie.name,
                dashStyle: 'dash'
              });
            }
          } else {
            range.labelhigh = 'Не определено';
            range.high = range.low + delta;
            range.labeltooltip += 'Не определено';
            range.color = {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [
                [0, 'white'],
                [1, colorSerie.color]
              ]
            };
          }
        }
        s.data.push(range);
      }
    }

    for (const c of category) {
      this.chartOptions.xAxis.categories.push(this.translate.instant(c.kind));
    }

    let i = 0.5;
    for (const c of this.chartOptions.xAxis.categories) {
      this.chartOptions.xAxis.plotLines.push({
        color: '#D5DBDB',
        dashStyle: 'dash',
        value: i++,
        width: 2
      });
    }
    for (const s of series) {
      for (const line of s.plotLines)
        this.chartOptions.yAxis.plotLines.push(line);
    }
    this.chartOptions.series = series;
    console.log(series);
  }

  changeHighchartsSpan(event) {
    console.log(event);
    console.log(event.srcElement.innerHTML);
    const atr = this.attributes.find(x => x.key === event.srcElement.innerHTML);
    console.log(atr);
    if (atr) {
      this.goToAttribute.emit('span_' + atr.span[0]);
    }
  }
}
