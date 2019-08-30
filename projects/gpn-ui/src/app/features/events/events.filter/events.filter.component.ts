import { Component, OnInit, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'gpn-event-filter',
  templateUrl: './events.filter.component.html',
  styleUrls: ['./events.filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventFilterComponent implements OnInit {

  @Input()  eventsType: Array<{id: string, description: string}>;
  @Output() onApplyFilter = new EventEmitter<Array<{name: string, value: any}>>();
  strEventsTypes = '';
  strLogin = '';
  _dateFrom : Date = null;
  _dateTo : Date = null;
  constructor() { }

  ngOnInit() {
  }

  openPopup() {
    document.getElementById('formPopup').style.display = 'block';
  }

  closePopup() {
    document.getElementById('formPopup').style.display = 'none';
    this.strEventsTypes = '';
    for (const s of this.eventsType) {
      const elem =  document.getElementById('chk_' + s.id);
      if ((elem as HTMLInputElement).checked)
        this.strEventsTypes = this.strEventsTypes.length === 0 ? s.description : this.strEventsTypes + ', ' + s.description;
    }
  }

  clearFilter(){
    this._dateFrom = null;
    this._dateTo = null;
    this.strEventsTypes = '';
    this.strLogin = '';
    for (const s of this.eventsType) {
      const elem =  document.getElementById('chk_' + s.id);
      (elem as HTMLInputElement).checked = false;
    }
  }

  applyFilter(){
    const docum_type : string[] = [];
    const filterVlaue : Array<{name: string, value: any}> = new Array<{name: string, value: string}>();
    if (this.eventsType)
      for (const s of this.eventsType) {
        const elem =  document.getElementById('chk_' + s.id);
        if ((elem as HTMLInputElement).checked)
          docum_type.push(s.id);
      }
      if (docum_type.length > 0) filterVlaue.push({name: 'event_type', value: docum_type});
    if (this.strLogin.length > 0)
      filterVlaue.push({name: 'login', value: this.strLogin});
    if (this._dateFrom)
      filterVlaue.push({name: 'date_from', value: this._dateFrom.getTime() / 1000});
    if (this._dateTo)
      filterVlaue.push({name: 'date_to', value: this._dateTo.getTime() / 1000});
    this.onApplyFilter.emit(filterVlaue);
  }
}
