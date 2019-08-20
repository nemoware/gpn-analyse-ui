import { Component, OnInit, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'gpn-doc-filter',
  templateUrl: './doc-filter.component.html',
  styleUrls: ['./doc-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocFilterComponent implements OnInit {
  @Input()  documTypes: Array<{str_id: string, name: string}>;
  @Output() onApplyFilter = new EventEmitter<Array<{name: string, value: any}>>();
  strDocumTypes = '';
  strNameOrg = '';
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
    this.strDocumTypes = '';
    for (const s of this.documTypes) {
      const elem =  document.getElementById('chk_' + s.str_id);
      if ((elem as HTMLInputElement).checked)
        this.strDocumTypes = this.strDocumTypes.length === 0 ? s.name : this.strDocumTypes + ', ' + s.name;
    }
  }

  clearFilter(){
    this._dateFrom = null;
    this._dateTo = null;
    this.strDocumTypes = '';
    this.strNameOrg = '';
    for (const s of this.documTypes) {
      const elem =  document.getElementById('chk_' + s.str_id);
      (elem as HTMLInputElement).checked = false;
    }
  }

  applyFilter(){
    const docum_type : string[] = [];
    const filterVlaue : Array<{name: string, value: any}> = new Array<{name: string, value: string}>();
    if (this.documTypes)
      for (const s of this.documTypes) {
        const elem =  document.getElementById('chk_' + s.str_id);
        if ((elem as HTMLInputElement).checked)
          docum_type.push(s.str_id);
      }
      if (docum_type.length > 0) filterVlaue.push({name: 'docum_type', value: docum_type});
    if (this.strNameOrg.length > 0)
      filterVlaue.push({name: 'name_org', value: this.strNameOrg});
    if (this._dateFrom)
      filterVlaue.push({name: 'date_from', value: this._dateFrom.getTime() / 1000});
    if (this._dateTo)
      filterVlaue.push({name: 'date_to', value: this._dateTo.getTime() / 1000});
    this.onApplyFilter.emit(filterVlaue);
  }
}
