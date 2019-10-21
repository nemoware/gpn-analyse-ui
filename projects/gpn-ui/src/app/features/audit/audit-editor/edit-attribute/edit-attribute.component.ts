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
      word: number[];
    }
  ) {}

  ngOnInit() {
    this._new = this.data.kind == null;
    /* const rightMostPos = window.innerWidth - Number(this.data.left);
    this.dialogRef.updatePosition({
      top: `${this.data.top}px`,
      right: `${rightMostPos}px`
    });*/

    this.editForm = this.fb.group({
      kind: new FormControl(
        { value: null, disabled: !this.data.editable },
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
      span: [this.data.word[0], this.data.word[this.data.word.length - 1]],
      span_map: 'word',
      word: this.data.word
    });
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
          kind: 'span',
          delete: null
        });
      }
    }
  }

  valid(): boolean {
    if (
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
  }

  change(e) {
    this._change = true;
  }
}
