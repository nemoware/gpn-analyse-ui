import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  AfterViewInit
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

  highcharts = Highcharts;
  colorSeries = [
    { name: 'finance', color: '#D7BDE2', colorPlotLines: '#9B59B6' },
    { name: 'deals', color: '#A9CCE3', colorPlotLines: '#2980B9' },
    { name: 'court', color: '#A3E4D7', colorPlotLines: '#1ABC9C' }
  ];
  postLineSeries = [];

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
      //enabled: false,
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

  ngOnInit() {
    let competences = this.attributes.filter(x =>
      x.kind.includes('competence')
    );
    competences = competences.sort((a, b) => {
      if (!a.parent || !b.parent) return 0;
      return a.parent.localeCompare(b.parent);
    });

    const series: any[] = [];

    for (const c of competences) {
      if (!c.parent) {
        for (const s of competences.filter(x => x.parent === c.kind)) {
          const nameSerie = s.kind.split('_');
          const name = nameSerie[nameSerie.length - 1];
          const colorSerie = this.colorSeries.find(x => x.name === name);

          const events = {
            show: function(chart) {
              if (chart.target.userOptions.plotLines)
                for (const line of chart.target.userOptions.plotLines)
                  chart.target.chart.yAxis[0].addPlotLine(line);
              console.log(chart.target.userOptions);
            },
            hide: function(chart) {
              chart.target.chart.yAxis[0].removePlotLine(name);
            }
          };

          let newSerie = {
            color: null,
            name: null,
            kind: null,
            data: [],
            events: events,
            plotLines: []
          };
          if (!series.find(x => x.kind === name)) {
            newSerie = {
              color: colorSerie.color,
              name: this.translate.instant(name),
              kind: name,
              data: [],
              events: events,
              plotLines: []
            };
            series.push(newSerie);
          } else newSerie = series.find(x => x.kind === name);
          const lowSum = competences.find(
            x => x.kind === s.kind + '_constraint_min'
          );
          const highSum = competences.find(
            x => x.kind === s.kind + '_constraint_max'
          );

          const range = {
            labellow: null,
            labelhigh: null,
            labeltooltip: null,
            low: null,
            high: null,
            color: null
          };

          if (lowSum) {
            console.log(lowSum);
            const currency = competences.find(
              x => x.kind === lowSum.kind + '_currency'
            );
            const sign = competences.find(
              x => x.kind === lowSum.kind + '_sign'
            );
            const value = competences.find(
              x => x.kind === lowSum.kind + '_value'
            );
            range.labellow = value.value + ' ' + currency.value;
            range.labeltooltip = value.value + ' ' + currency.value + ' - ';
            range.low = value.value;

            if (
              !newSerie.plotLines.find(x => x.value === value.value) &&
              Number(value.value) !== 0
            ) {
              newSerie.plotLines.push({
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
              stops: [[0, colorSerie.color], [1, 'white']]
            };
          }

          if (highSum) {
            const currency = competences.find(
              x => x.kind === highSum.kind + '_currency'
            );
            const sign = competences.find(
              x => x.kind === highSum.kind + '_sign'
            );
            const value = competences.find(
              x => x.kind === highSum.kind + '_value'
            );
            range.labelhigh = value.value + ' ' + currency.value;
            range.labeltooltip += value.value + ' ' + currency.value;
            range.high = value.value;
            if (!newSerie.plotLines.find(x => x.value === value.value)) {
              newSerie.plotLines.push({
                value: value.value,
                color: colorSerie.colorPlotLines,
                width: 2,
                id: colorSerie.name,
                dashStyle: 'dash'
              });
            }
          } else {
            range.labelhigh = 'Не определено';
            range.high = range.low;
            range.labeltooltip += 'Не определено';
            range.color = {
              linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
              stops: [[0, 'white'], [1, colorSerie.color]]
            };
          }

          newSerie.data.push(range);
        }
        this.chartOptions.xAxis.categories.push(this.translate.instant(c.kind));
      }
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
}
