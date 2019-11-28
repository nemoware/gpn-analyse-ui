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
  _change = false;
  _new = false;
  infoMessage = 'Данный фрагмент не редактируется!';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditAttributeComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      editable: boolean;
      left: number;
      top: number;
      kind: string;
      display_value: string;
      value: string;
      documentType: KindAttributeModel[];
      attributes: AttributeModel[];
      indexStart: number;
      indexEnd: number;
      editMode: boolean;
    }
  ) {
    if (!this.data.editMode)
      this.infoMessage = 'В режиме просмотра редактирование запрещено!';
  }

  ngOnInit() {
    this._new = this.data.kind == null;
    /* const rightMostPos = window.innerWidth - Number(this.data.left);
    this.dialogRef.updatePosition({
      top: `${this.data.top}px`,
      right: `${rightMostPos}px`
    });*/

    this.editForm = this.fb.group({
      kind: new FormControl(
        { value: null, disabled: !this.data.editable || !this.data.editMode },
        Validators.required
      )
    });
    if (this.data.kind) {
      this.selectedKind = this.data.documentType.find(
        c => c.kind === this.data.kind
      );
      this.editForm.get('kind').setValue(this.selectedKind);
    }
  }

  closeForm() {
    this.dialogRef.close();
  }

  applyChanges() {
    const _atr = this.data.attributes.find(
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
    });
  }

  deleteAtr() {
    if (confirm('Удалить данный атрибут?')) {
      const del = this.data.attributes.find(
        c => c.kind === this.selectedKind.kind
      );
      if (del) {
        this.data.attributes = this.data.attributes.filter(
          item => item.kind !== del.kind
        );
        this.dialogRef.close({
          attributes: this.data.attributes,
          kind: null,
          delete: del
        });
      }
    }
  }

  valid(): boolean {
    if (
      !this.data.editMode ||
      !this.data.editable ||
      this.data.value == null ||
      this.data.value.length === 0 ||
      !this._change
    )
      return false;
    else return this.editForm.valid;
  }

  changedKind(e) {
    this.data.value = null;
    this._change = true;
    this.selectedKind = this.editForm.get('kind').value;
    if (this.selectedKind.type === 'string') {
      this.data.value = this.data.display_value;
    } else if (this.selectedKind.type === 'number') {
      const value = this.data.display_value.match(/\d+/);
      if (value) this.data.value = value[0];
    }
  }

  change(e) {
    this._change = true;
  }
}
