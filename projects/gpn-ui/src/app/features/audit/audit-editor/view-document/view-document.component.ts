import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  Input,
  ViewEncapsulation,
  ChangeDetectorRef,
  Output,
  EventEmitter
} from '@angular/core';
import { Document } from '@app/models/document.model';
import { Helper } from '@app/features/audit/helper';
import { Tag } from '@app/models/legal-document';
import { KindAttribute } from '@app/models/kind-attribute';
import {
  faChevronDown,
  faChevronUp,
  faEdit,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@root/node_modules/@angular/router';
import { MatDialog } from '@root/node_modules/@angular/material';
import { EditAttributeComponent } from '@app/features/audit/audit-editor/edit-attribute/edit-attribute.component';
import { AuditService } from '@app/features/audit/audit.service';
import { KindAttributeModel } from '@app/models/kind-attribute-model';
import { AttributeModel } from '@app/models/attribute-model';

@Component({
  selector: 'gpn-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ViewDocumentComponent implements OnInit, AfterViewInit {
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faEdit = faEdit;
  faSave = faSave;

  @Input() document: Document;
  @Input() editmode: boolean;
  @Input() documentType: KindAttributeModel[];
  @Input() attributes: Array<AttributeModel>;
  @Output() changeAttribute = new EventEmitter<AttributeModel[]>();

  changed = false;
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    private auditservice: AuditService
  ) {}

  ngOnInit() {
    if (this.document) {
      this.loadDoc();
    }
  }

  ngAfterViewInit(): void {
    this.documentType = [
      {
        kind: 'subject',
        type: 'dictionary',
        values: ['Charity', 'Deal', 'PropertyDeal'],
        editable: true
      },
      { kind: 'value', type: 'number', values: null, editable: true },
      { kind: 'org_1_name', type: 'string', values: null, editable: true },
      { kind: 'org_1_alt_name', type: 'string', values: null, editable: true },
      { kind: 'org_1_alias', type: 'string', values: null, editable: false },
      { kind: 'org_1_type', type: 'string', values: null, editable: false },
      { kind: 'org_2_name', type: 'string', values: null, editable: true },
      { kind: 'org_2_alt_name', type: 'string', values: null, editable: true },
      { kind: 'org_2_alias', type: 'string', values: null, editable: false },
      { kind: 'org_2_type', type: 'string', values: null, editable: false },
      { kind: 'new_attribute', type: 'string', values: null, editable: false }
    ];
    if (this.editmode) {
      /*this.auditservice
        .getDoumentType(this.document.documentType)
        .subscribe(docType => {
          this.documentType = docType;
        });*/
    }
  }

  loadDoc() {
    const view_doc = document.getElementById('view_doc');
    let result = this.document.analysis.normal_text;
    const words = this.document.analysis.tokenization_maps.words;

    for (const _atr of this.attributes) {
      _atr.word = [];
      if (_atr.span)
        for (let i = _atr.span[0]; i < _atr.span[1]; i++) _atr.word.push(i);
    }

    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      let classSpan;
      const _atr = this.attributes.find(x => x.word.includes(i));
      if (_atr) classSpan = _atr.kind;
      else classSpan = 'span';
      const txtS = `<span class="${classSpan}" id="span_${i}">`;
      const txtE = '</span>';
      result = result.slice(0, word[1]) + txtE + result.slice(word[1]);
      result = result.slice(0, word[0]) + txtS + result.slice(word[0]);
    }

    result = '<span id="top"></span>' + result + '<span id="foot"> </span>';
    view_doc.insertAdjacentHTML('afterbegin', result);
  }

  getClassName(kind: string) {
    let nameClassSpan = 'unknown';
    if (kind.includes('headline')) nameClassSpan = 'headline';
    if (kind in KindAttribute) nameClassSpan = kind;
    return nameClassSpan;
  }

  public goToAttribute(id) {
    const element = document.getElementById(id);
    if (element != null)
      element.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
  }

  getSelectedText(e: MouseEvent) {
    if (!this.editmode) return;
    let selectAttribute: string;
    let kind: string;
    let value: string;
    let display_value: string;
    let editable = true;
    let word: number[] = [];
    if (
      document.getSelection().anchorNode === null ||
      (document.getSelection().isCollapsed &&
        document.getSelection().anchorNode.parentElement.id === 'view_doc')
    )
      return;
    else if (
      document.getSelection().isCollapsed &&
      document.getSelection().anchorNode.parentElement.id !== 'view_doc'
    ) {
      const element = document.getElementById(
        document.getSelection().anchorNode.parentElement.id
      );
      if (
        element == null ||
        element.classList == null ||
        element.classList.contains('span')
      )
        return;
      else selectAttribute = element.id;
    }

    let idStart;
    let idEnd;
    // select attribute
    if (selectAttribute) {
      const indexWord = Number(selectAttribute.split('_')[1]);
      const _atr = this.attributes.find(x => x.word.includes(indexWord));
      kind = _atr.kind;
      value = _atr.value;
      display_value = _atr.display_value;
      const selectedKind = this.documentType.find(c => c.kind === _atr.kind);
      editable = selectedKind.editable;
      idStart = 'span_' + _atr.span[0];
      idEnd = 'span_' + _atr.span[1];
      word = _atr.word;
    } else {
      if (document.getSelection().anchorNode.parentElement.id === 'view_doc') {
        idStart = (document.getSelection().anchorNode
          .nextSibling as HTMLElement).id;
      } else idStart = document.getSelection().anchorNode.parentElement.id;

      if (document.getSelection().focusNode.parentElement.id === 'view_doc') {
        idEnd = (document.getSelection().focusNode
          .previousSibling as HTMLElement).id;
      } else idEnd = document.getSelection().focusNode.parentElement.id;

      if (Number(idStart.split('_')[1]) > Number(idEnd.split('_')[1])) return;
      for (
        let i = Number(idStart.split('_')[1]);
        i <= Number(idEnd.split('_')[1]);
        i++
      )
        word.push(i);
      const words = this.document.analysis.tokenization_maps.words;
      const wordS = words[idStart.split('_')[1]];
      const wordE = words[idEnd.split('_')[1]];
      display_value = this.document.analysis.normal_text.slice(
        wordS[0],
        wordE[1]
      );
    }

    const dialogRef = this.dialog.open(EditAttributeComponent, {
      width: '50%',
      data: {
        top: e.pageY,
        left: e.pageX,
        display_value: display_value,
        value: value,
        documentType: this.documentType,
        kind: kind,
        editable: editable,
        attributes: this.attributes,
        word: word
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        this.attributes = result.attributes;
        this.changeAttribute.emit(result.attributes);
        this.changed = true;
        this.setElementClass(idStart, idEnd, result.kind);
        if (result.delete)
          this.setElementClass(
            'span_' + result.delete[0],
            'span_' + result.delete[1],
            'span'
          );
        this.changeDetectorRefs.detectChanges();
      }
    });
  }

  setElementClass(idStart, idEnd, kind) {
    for (const elem of this.getArrayNodes(idStart, idEnd)) {
      elem.classList.forEach(c => {
        elem.classList.remove(c);
      });
      elem.classList.add(kind);
    }
  }

  getArrayNodes(idS: string, idE: string): Array<Element> {
    const nodes: Array<Element> = [];
    const elementS = document.getElementById(idS);
    const elementE = document.getElementById(idE);
    let elem: Element = elementS;
    nodes.push(elementS);
    while (elem !== elementE) {
      elem = elem.nextElementSibling;
      nodes.push(elem);
    }
    return nodes;
  }

  editMode() {
    this.router.navigate(['audit/edit/', this.document._id]);
  }

  saveChanges() {
    const atr = {};
    this.attributes.forEach(
      item =>
        (atr[item.kind] = {
          confidence: item.confidence,
          display_value: item.display_value,
          kind: item.kind,
          span: item.span,
          span_map: item.span_map,
          value: item.value
        })
    );

    this.auditservice.updateDocument(this.document._id, atr).subscribe(data => {
      console.log(data);
    });
  }
}
