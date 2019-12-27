import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject
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
@Component({
  selector: 'gpn-edit-attribute',
  templateUrl: './edit-attribute.component.html',
  styleUrls: ['./edit-attribute.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAttributeComponent implements OnInit {
  faTimes = faTimes;
  editForm: FormGroup;
  selectedKind: KindAttributeModel;
  dictionaryValues: Array<{ id: string; value: string }>;
  _change = false;
  _new = false;
  readOnly = false;
  constructor(
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
    )
      this.dictionaryValues = Dictionaries.getDictionary(
        this.data.kinds.find(x => x.kind === this.data.kind).dictionaryName
      );

    this.editForm = this.fb.group({
      kind: new FormControl({ value: null }, Validators.required)
    });

    if (this.data.kind) {
      this.selectedKind = this.data.kinds.find(c => c.kind === this.data.kind);
      if (this.selectedKind)
        this.editForm.get('kind').setValue(this.selectedKind);
      else this.readOnly = true;
    }
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
    if (
      this.data.value == null ||
      this.data.value.length === 0 ||
      !this._change
    )
      return false;
    else return this.editForm.valid;
    return false;
  }

  changedKind(e) {
    this.data.value = null;
    this._change = true;
    this.selectedKind = this.editForm.get('kind').value;

    if (this.selectedKind.dictionaryName)
      this.dictionaryValues = Dictionaries.getDictionary(
        this.selectedKind.dictionaryName
      );

    if (this.selectedKind.type === 'string') {
      this.data.value = this.data.displayValue;
    } else if (this.selectedKind.type === 'number') {
      const value = this.data.displayValue.match(/\d+/);
      if (value) this.data.value = value[0];
    }
  }

  change(e) {
    this._change = true;
    if (e.target && e.target.id === 'stringDate') {
      this.setDateValue(e.target.value);
    }
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
}
