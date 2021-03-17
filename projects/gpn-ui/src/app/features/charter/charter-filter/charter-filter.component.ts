import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@root/node_modules/@angular/forms';
import {
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@root/node_modules/@angular/core';
import { DateAdapter } from '@root/node_modules/@angular/material';
import { CharterStates } from '@app/features/charter/list-charter/list.charter.component';

@Component({
  selector: 'gpn-charter-filter',
  templateUrl: './charter-filter.component.html',
  styleUrls: ['./charter-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CharterFilterComponent implements OnInit {
  filter = new FormControl();

  @Input() charterStates: CharterStates[];
  @Output() ApplyFilter = new EventEmitter<
    Array<{ name: string; value: any }>
  >();

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.applyFilter();
    }
  }

  selectedStatuses: CharterStates[];
  _dateFrom: Date = null;
  _dateTo: Date = null;
  _createDate: Date = null;
  subsidiaryName = '';
  constructor(private dateAdapter: DateAdapter<Date>) {}

  ngOnInit() {
    this.dateAdapter.getFirstDayOfWeek = () => {
      return 1;
    };
  }

  clearFilter() {
    this._dateFrom = null;
    this._dateTo = null;
    this._createDate = null;
    this.selectedStatuses = [];
    this.subsidiaryName = '';
  }

  applyFilter() {
    const filterValue: Array<{ name: string; value: any }> = new Array<{
      name: string;
      value: string;
    }>();
    if (this.selectedStatuses) {
      filterValue.push({
        name: 'charterStatuses',
        value: this.selectedStatuses
      });
    }
    if (this._dateFrom)
      filterValue.push({
        name: 'dateFrom',
        value: this._dateFrom.toLocaleDateString()
      });
    if (this._dateTo)
      filterValue.push({
        name: 'dateTo',
        value: this._dateTo.toLocaleDateString()
      });
    if (this.subsidiaryName.length > 0)
      filterValue.push({
        name: 'subsidiaryName',
        value: this.subsidiaryName
      });
    this.ApplyFilter.emit(filterValue);
  }
}
