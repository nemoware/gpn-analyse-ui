import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditAttributeComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      atr: AttributeModel;
      atrParent: AttributeModel;
      kinds: KindAttributeModel[];
    }
  ) {}

  ngOnInit() {
    this._new = !this.data.atr.kind;
    if (
      this.data.atr.kind &&
      this.data.kinds.find(x => x.kind === this.data.atr.kind).dictionaryName
    )
      this.dictionaryValues = Dictionaries.getDictionary(
        this.data.kinds.find(x => x.kind === this.data.atr.kind).dictionaryName
      );
    /* const rightMostPos = window.innerWidth - Number(this.data.left);
    this.dialogRef.updatePosition({
      top: `${this.data.top}px`,
      right: `${rightMostPos}px`
    });*/

    this.editForm = this.fb.group({
      kind: new FormControl({ value: null }, Validators.required)
    });
    if (this.data.atr.kind) {
      this.selectedKind = this.data.kinds.find(
        c => c.kind === this.data.atr.kind
      );
      this.editForm.get('kind').setValue(this.selectedKind);
    }
  }

  closeForm() {
    this.dialogRef.close();
  }

  applyChanges() {
    /* const _atr = this.data.attributes.find(
      c => c.kind === this.selectedKind.kind
    );
    if (_atr) {
      if (
        this._new &&
        !confirm('Фрагмент текста с таким типом уже сущесвует! Заменить?')
      )
        return;
      this.data.attributes = this.data.attributes.filter(
        item => item.kind !== _atr.kind
      );
    }

    this.data.attributes.push({
      confidence: 1,
      display_value: this.data.display_value,
      kind: this.selectedKind.kind,
      value: this.data.value,
      span: [this.data.indexStart, this.data.indexEnd],
      span_map: 'word',
      parent: null,
      num: null,
      key: null
    });
    console.log(this.data.attributes);
    this.dialogRef.close({
      attributes: this.data.attributes,
      kind: this.selectedKind.kind,
      delete: _atr && this._new ? _atr.span : null
    });*/
  }

  deleteAtr() {
    if (confirm('Удалить данный атрибут?')) {
      this.dialogRef.close({ delete: true });
    }
  }

  valid(): boolean {
    /*if (
      this.data.value == null ||
      this.data.value.length === 0 ||
      !this._change
    )
      return false;
    else return this.editForm.valid;*/
    return false;
  }

  changedKind(e) {
    /*this.data.value = null;
    this._change = true;
    this.selectedKind = this.editForm.get('kind').value;
    if (this.selectedKind.type === 'string') {
      this.data.value = this.data.display_value;
    } else if (this.selectedKind.type === 'number') {
      const value = this.data.display_value.match(/\d+/);
      if (value) this.data.value = value[0];
    }*/
  }

  change(e) {
    this._change = true;
  }
}
