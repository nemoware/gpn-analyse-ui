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
import { AttributeModel } from '@app/models/attribute-model';
@Component({
  selector: 'gpn-edit-attribute',
  templateUrl: './edit-attribute.component.html',
  styleUrls: ['./edit-attribute.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAttributeComponent implements OnInit {
  faTimes = faTimes;
  doctype: string;
  constructor(
    public dialogRef: MatDialogRef<EditAttributeComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      left: number;
      top: number;
      kind: string;
      display_value: string;
      value: string;
      documentType: AttributeModel[];
      editable: boolean;
    }
  ) {}

  ngOnInit() {
    const rightMostPos = window.innerWidth - Number(this.data.left);
    this.dialogRef.updatePosition({
      top: `${this.data.top}px`,
      right: `${rightMostPos}px`
    });
  }

  closeForm() {
    this.dialogRef.close();
  }

  applyChanges() {
    this.dialogRef.close({ type: this.doctype });
  }

  deleteAtr() {
    confirm('Удалить данный атрибут?');
  }

  valid(): boolean {
    return !(this.doctype == null);
  }
}
