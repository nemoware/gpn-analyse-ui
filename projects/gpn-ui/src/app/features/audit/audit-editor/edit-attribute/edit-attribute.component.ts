import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  OnDestroy
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDatepickerInputEvent,
  MatDialogRef
} from '@root/node_modules/@angular/material';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { KindAttributeModel } from '@app/models/kind-attribute-model';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators
} from '@root/node_modules/@angular/forms';
import { AttributeModel } from '@app/models/attribute-model';
import { Dictionaries } from '@app/models/dictionaries';
import { ReplaySubject, Subject } from '@root/node_modules/rxjs';
import { takeUntil } from '@root/node_modules/rxjs/operators';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
@Component({
  selector: 'gpn-edit-attribute',
  templateUrl: './edit-attribute.component.html',
  styleUrls: ['./edit-attribute.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAttributeComponent implements OnInit, OnDestroy {
  public kindCtrl: FormControl = new FormControl();
  public kindFilterCtrl: FormControl = new FormControl();
  public filteredKinds: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  public valueCtrl: FormControl = new FormControl();
  public valueFilterCtrl: FormControl = new FormControl();
  public filteredValues: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

  private _onDestroy = new Subject<void>();

  faTimes = faTimes;
  selectedKind: KindAttributeModel;
  dictionaryValues: Array<{ id: string; value: string }>;
  _change = false;
  _new = false;
  readOnly = false;
  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditAttributeComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      displayValue: string;
      span: [];
      value: string;
      kind: string;
      atrParent: AttributeModel;
      kinds: KindAttributeModel[];
    }
  ) {}

  ngOnInit() {
    this._new = !this.data.kind;
    if (
      this.data.kind &&
      this.data.kinds.find(x => x.kind === this.data.kind) &&
      this.data.kinds.find(x => x.kind === this.data.kind).dictionaryName
    ) {
      this.dictionaryValues = Dictionaries.getDictionary(
        this.data.kinds.find(x => x.kind === this.data.kind).dictionaryName
      );
      this.filteredValues.next(this.dictionaryValues.slice());
      this.valueCtrl.setValue(
        this.dictionaryValues.find(x => x.id === this.data.value)
      );
    }

    if (this.data.kind) {
      this.selectedKind = this.data.kinds.find(c => c.kind === this.data.kind);
      if (this.selectedKind) this.kindCtrl.setValue(this.selectedKind);
      else this.readOnly = true;
    }

    this.filteredKinds.next(this.data.kinds.slice());
    this.kindFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterValue(
          this.data.kinds,
          this.kindFilterCtrl,
          this.filteredKinds,
          'kind'
        );
      });

    this.valueFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterValue(
          this.dictionaryValues,
          this.valueFilterCtrl,
          this.filteredValues,
          'value'
        );
      });
  }

  closeForm() {
    this.dialogRef.close();
  }

  applyChanges() {
    this.dialogRef.close({
      kind: this.selectedKind.kind,
      value: this.data.value
    });
  }

  deleteAtr() {
    if (confirm('Удалить данный атрибут?')) {
      this.dialogRef.close({ delete: true });
    }
  }

  valid(): boolean {
    if (this.kindCtrl.value && this.kindCtrl.value.hideValue) return true;
    else if (
      this.data.value == null ||
      this.data.value.length === 0 ||
      !this._change
    )
      return false;
    else return !!this.data.value;
    return false;
  }

  changedKind(e) {
    this.data.value = null;
    this._change = true;
    console.log(this.kindCtrl);
    this.selectedKind = this.kindCtrl.value;

    if (this.selectedKind.dictionaryName) {
      this.dictionaryValues = Dictionaries.getDictionary(
        this.selectedKind.dictionaryName
      );
      this.filteredValues.next(this.dictionaryValues.slice());
    }

    if (this.selectedKind.type === 'string') {
      this.data.value = this.data.displayValue;
    } else if (this.selectedKind.type === 'number') {
      const value = this.data.displayValue.match(/\d+/);
      if (value) this.data.value = value[0];
    }
  }

  change(e, dictionary = false) {
    this._change = true;
    if (e.target && e.target.id === 'stringDate') {
      this.setDateValue(e.target.value);
    } else if (dictionary) this.data.value = e;
  }

  changeDate(e) {
    if (e.value) {
      this._change = true;
      this.setDateValue(this.data.value.toLocaleString().split(',')[0]);
    }
  }

  setDateValue(value: string) {
    const d = value.replace('_', '0').split('.');
    this.data.value = `${d[2]}-${d[1]}-${d[0]}T00:00:00.000Z`;
    console.log(this.data.value);
  }

  private filterValue(array, filter, filteredValue, nameField) {
    if (!array) {
      return;
    }
    let search = filter.value;
    if (!search) {
      filteredValue.next(array.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    filteredValue.next(
      array.filter(x => {
        const rusValue = this.translate.instant(x[nameField]);
        return rusValue.toLowerCase().indexOf(search) > -1;
      })
    );
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
}
