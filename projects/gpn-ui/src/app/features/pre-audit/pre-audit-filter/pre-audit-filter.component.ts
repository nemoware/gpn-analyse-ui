import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@root/node_modules/@angular/forms';
import {
  EventEmitter,
  HostListener,
  Input,
  Output
} from '@root/node_modules/@angular/core';
import { DateAdapter } from '@root/node_modules/@angular/material';

@Component({
  selector: 'gpn-pre-audit-filter',
  templateUrl: './pre-audit-filter.component.html',
  styleUrls: ['./pre-audit-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreAuditFilterComponent implements OnInit {
  filter = new FormControl();

  @Input() auditStatuses: string[];
  @Output() ApplyFilter = new EventEmitter<
    Array<{ name: string; value: any }>
  >();

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.applyFilter();
    }
  }

  checkTypes = ['InsiderControl', 'InterestControl'];
  users = [];
  selectedStatuses = '';
  selectedTypes = '';
  selectedUsers = '';
  _createDate: Date = null;
  constructor(private dateAdapter: DateAdapter<Date>) {}

  ngOnInit() {
    this.dateAdapter.getFirstDayOfWeek = () => {
      return 1;
    };
  }

  clearFilter() {
    this._createDate = null;
    this.selectedStatuses = '';
    this.selectedTypes = '';
    this.selectedUsers = '';
  }

  applyFilter() {
    const filterValue: Array<{ name: string; value: any }> = new Array<{
      name: string;
      value: string;
    }>();
    if (this.selectedStatuses) {
      filterValue.push({ name: 'auditStatuses', value: this.selectedStatuses });
    }
    if (this.selectedUsers) {
      filterValue.push({ name: 'selectedUsers', value: this.selectedUsers });
    }
    if (this.selectedTypes) {
      filterValue.push({ name: 'checkTypes', value: this.selectedTypes });
    }
    if (this._createDate)
      filterValue.push({
        name: 'createDate',
        value: this._createDate.toLocaleDateString()
      });
    this.ApplyFilter.emit(filterValue);
  }
}
