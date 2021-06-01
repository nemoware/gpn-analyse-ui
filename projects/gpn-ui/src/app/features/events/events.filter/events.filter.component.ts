import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output
} from '@angular/core';
import { DateAdapter } from '@root/node_modules/@angular/material';
import { FormControl } from '@root/node_modules/@angular/forms';
import { CharterStates } from '@app/features/charter/list-charter/list.charter.component';

@Component({
  selector: 'gpn-event-filter',
  templateUrl: './events.filter.component.html',
  styleUrls: ['./events.filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventFilterComponent implements OnInit {
  toppings = new FormControl();
  toppingList: string[] = [
    'Extra cheese',
    'Mushroom',
    'Onion',
    'Pepperoni',
    'Sausage',
    'Tomato'
  ];

  @Input() eventsType: Array<{ _id: string; name: string }>;
  @Output() ApplyFilter = new EventEmitter<
    Array<{ name: string; value: any }>
  >();
  selectedValue = '';
  strLogin = '';
  _dateFrom: Date = null;
  _dateTo: Date = null;

  constructor(private dateAdapter: DateAdapter<Date>) {}

  ngOnInit() {
    this.dateAdapter.getFirstDayOfWeek = () => {
      return 1;
    };
  }

  clearFilter() {
    // console.log(this.selectedValue);
    this._dateFrom = null;
    this._dateTo = null;
    this.selectedValue = '';
    this.strLogin = '';
  }

  applyFilter() {
    const filterVlaue: Array<{ name: string; value: any }> = new Array<{
      name: string;
      value: string;
    }>();
    if (this.selectedValue) {
      filterVlaue.push({ name: 'eventType', value: this.selectedValue });
    }
    if (this.strLogin.length > 0)
      filterVlaue.push({ name: 'login', value: this.strLogin });
    if (this._dateFrom)
      filterVlaue.push({
        name: 'dateFrom',
        value: this._dateFrom.toLocaleDateString()
      });
    if (this._dateTo)
      filterVlaue.push({
        name: 'dateTo',
        value: this._dateTo.toLocaleDateString()
      });
    this.ApplyFilter.emit(filterVlaue);
  }
}
