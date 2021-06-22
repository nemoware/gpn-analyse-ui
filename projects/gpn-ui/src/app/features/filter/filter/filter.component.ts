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
import { FilterPages } from '@app/models/filter.pages';

@Component({
  selector: 'gpn-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit {
  filter = new FormControl();

  // @Input() arrayStatuses: string[];
  @Input() filterPage: FilterPages;
  @Input() states:
    | CharterStates[]
    | string[]
    | Array<{ _id: string; name: string }>;
  @Output() ApplyFilter = new EventEmitter<
    Array<{ name: string; value: any }>
  >();

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.applyFilter();
    }
  }

  selectedStatuses = '';
  _dateFrom: Date = null;
  _dateTo: Date = null;
  _createDate: Date = null;
  subsidiaryName = '';
  pagesFromModel = FilterPages;
  selectedTypes = '';
  checkTypes = ['InsiderControl', 'InterestControl'];
  selectedUsers = '';
  users = [];

  placeholder: Placeholder = {
    preAudit: ['Пользователь', 'Вид проверки', 'Статус проверки'],
    audit: ['Наименование ДО', '', 'Статус проверки', 'Период проверки'],
    charter: ['Наименование ДО', '', 'Статус устава', 'Период действия устава'],
    events: ['Поиск пользователя', '', 'Тип события', 'Диапазон дат событий'],
    affiliates: ['Полное фирменное наименование или ФИО']
  };
  placeHolderForHtml: string[];

  constructor(private dateAdapter: DateAdapter<Date>) {}

  ngOnInit() {
    this.dateAdapter.getFirstDayOfWeek = () => {
      return 1;
    };
    if (this.filterPage === FilterPages['pre-audit'])
      this.placeHolderForHtml = this.placeholder['preAudit'];
    else
      this.placeHolderForHtml = this.placeholder[FilterPages[this.filterPage]];
  }

  clearFilter() {
    this._dateFrom = null;
    this._dateTo = null;
    this._createDate = null;
    this.selectedStatuses = '';
    this.subsidiaryName = '';
    this.selectedTypes = '';
    this.selectedUsers = '';
  }

  applyFilter() {
    const filterValue: Array<{ name: string; value: any }> = new Array<{
      name: string;
      value: string;
    }>();
    if (this.selectedStatuses) {
      filterValue.push({
        name: this.getNameParamForFilter(),
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
    if (this._createDate)
      filterValue.push({
        name: 'createDate',
        value: this._createDate.toLocaleDateString()
      });
    if (this.subsidiaryName.length > 0)
      filterValue.push({
        name: this.getNameParamForSubsidiaryName(),
        value: this.subsidiaryName
      });
    if (this.selectedTypes) {
      filterValue.push({ name: 'checkTypes', value: this.selectedTypes });
    }
    this.ApplyFilter.emit(filterValue);
  }

  getNameParamForFilter() {
    switch (this.filterPage) {
      case FilterPages.audit:
        return `${FilterPages[this.filterPage]}Statuses`;
      case FilterPages['pre-audit']:
        return 'auditStatuses';
      default:
        return 'eventType';
    }
  }

  getNameParamForSubsidiaryName() {
    switch (this.filterPage) {
      case FilterPages.events:
        return 'login';
      case FilterPages.audit:
      case FilterPages.charter:
        return 'subsidiaryName';
      case FilterPages['pre-audit']:
        return 'selectedUsers';
      case FilterPages.affiliates:
        return 'name';
    }
  }
}

interface Placeholder {
  preAudit: string[];
  audit: string[];
  charter: string[];
  events: string[];
  affiliates: string[];
}
