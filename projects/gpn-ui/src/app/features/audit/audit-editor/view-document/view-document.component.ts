import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  Input,
  ViewEncapsulation,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { Document } from '@app/models/document.model';
import { KindAttribute } from '@app/models/kind-attribute';
import {
  faChevronDown,
  faChevronUp,
  faEdit,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Router } from '@root/node_modules/@angular/router';
import { MatDialog } from '@root/node_modules/@angular/material';
import { EditAttributeComponent } from '@app/features/audit/audit-editor/edit-attribute/edit-attribute.component';
import { AuditService } from '@app/features/audit/audit.service';
import { AttributeModel } from '@app/models/attribute-model';
import { DocumentTypeModel } from '@app/models/document-type-model';
import { KindAttributeModel } from '@app/models/kind-attribute-model';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';

@Component({
  selector: 'gpn-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ViewDocumentComponent implements OnInit, AfterViewInit, OnDestroy {
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faEdit = faEdit;
  faSave = faSave;

  @Input() document: Document;
  @Input() editmode: boolean;
  @Input() documentType: KindAttributeModel[];
  @Input() attributes: Array<AttributeModel>;
  @Output() changeAttribute = new EventEmitter<AttributeModel[]>();
  @Output() refresh = new EventEmitter();

  changed = false;
  constructor(
    private router: Router,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    private auditservice: AuditService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    if (this.document) {
      this.refreshView();
    }
  }

  ngAfterViewInit(): void {
    this.auditservice
      .getDoumentTypeAtr(this.document.documentType)
      .subscribe(docType => {
        this.documentType = docType;
      });
  }

  


  refreshView() {
    const view_doc = document.getElementById('view_doc');
    let result = this.document.analysis.normal_text;
    const words = this.document.analysis.tokenization_maps.words;
    const elementsH = document.getElementsByClassName('hint');
    for (let i = 0; i < elementsH.length; i++) {
      elementsH[i].removeEventListener(
        'click',
        this.getInfoAttribute.bind(this)
      );
    }

    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      let tagStart = '';
      let tagEnd = '';
      let headerStart = '';
      let headerEnd = '';

      const _atr = this.attributes.find(
        x =>
          x.display_value != null &&
          (x.span[0] === i || x.span[1] - 1 === i) &&
          x.span[0] !== x.span[1]
      );
      if (_atr) {
        const clazz = this.getAttributeClass(_atr.kind)
        if (_atr.span[0] === i) {
          tagStart = `<span class="${clazz} hint_span">`;
        }
        if (_atr.span[1] - 1 === i) {
          tagEnd = `<span class="hint">${this.translate.instant(
            clazz
          )}</span></span>`;
        }
      }

      const _header = this.document.analysis.headers.find(
        x =>
          x.display_value != null &&
          (x.span[0] === i || x.span[1] - 1 === i) &&
          x.span[0] !== x.span[1]
      );
      if (_header) {
        if (_header.span[0] === i) {
          headerStart = `<span class="headline">`;
        }
        if (_header.span[1] - 1 === i) {
          headerEnd = '</span> ';
        }
      }

      const txtS = headerStart + tagStart + `<span id="span_${i}">`;
      const txtE = '</span>' + tagEnd + headerEnd;
      result = result.slice(0, word[1]) + txtE + result.slice(word[1]);
      result = result.slice(0, word[0]) + txtS + result.slice(word[0]);
    }

    result = '<span id="top"></span>' + result + '<span id="foot"> </span>';
    if (view_doc.innerHTML) view_doc.innerHTML = result;
    else view_doc.insertAdjacentHTML('afterbegin', result);
    const elements = document.getElementsByClassName('hint');
    for (let i = 0; i < elements.length; i++) {
      elements[i].addEventListener('click', this.getInfoAttribute.bind(this));
    }
  }

  getInfoAttribute(e) {
    const _atr = this.attributes.find(
      x => x.kind === e.target.parentElement.classList[0]
    );
    if (_atr) {
      const kindAtr = this.documentType.find(x => x.kind === _atr.kind);
      this.showAttributeInfo(
        _atr.span[0],
        _atr.span[1] - 1,
        kindAtr.editable,
        _atr.display_value,
        _atr.kind,
        _atr.value
      );
    }
  }

  getClassName(kind: string) {
    let nameClassSpan = 'unknown';
    if (kind.includes('headline')) nameClassSpan = 'headline';
    if (kind in KindAttribute) nameClassSpan = kind;
    return nameClassSpan;
  }

  getAttributeClass(attrKind) {
    // TODO compare with getClassName (which is not in use)  
    let clazz =attrKind.split('/').pop()
    clazz = clazz.replace('_', '-');
    clazz = clazz.replace(/(?<=.)(-\d+)$/, '')
    return clazz;
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
    if (!this.editmode || e.button > 0) return;

    let display_value: string;
    if (
      document.getSelection().anchorNode === null ||
      document.getSelection().isCollapsed ||
      document.getSelection().focusNode.nodeValue === ' '
    )
      return;

    let idStart;
    let parentStart;
    let idEnd;
    let parentEnd;

    if (document.getSelection().anchorNode.parentElement.id === 'view_doc') {
      idStart = (document.getSelection().anchorNode.nextSibling as HTMLElement)
        .id;
      parentStart = (document.getSelection().anchorNode
        .nextSibling as HTMLElement).parentElement;
    } else {
      idStart = document.getSelection().anchorNode.parentElement.id;
      parentStart = document.getSelection().anchorNode.parentElement
        .parentElement;
    }

    if (document.getSelection().focusNode.parentElement.id === 'view_doc') {
      idEnd = (document.getSelection().focusNode.previousSibling as HTMLElement)
        .id;
      parentEnd = (document.getSelection().anchorNode
        .previousSibling as HTMLElement).parentElement;
    } else {
      idEnd = document.getSelection().focusNode.parentElement.id;
      parentEnd = document.getSelection().focusNode.parentElement.parentElement;
    }

    if (Number(idStart.split('_')[1]) > Number(idEnd.split('_')[1])) return;

    if (parentEnd !== parentStart) {
      alert('Пересечение атрибутов недопустимо!');
      return;
    }

    const words = this.document.analysis.tokenization_maps.words;
    const wordS = words[idStart.split('_')[1]];
    const wordE = words[idEnd.split('_')[1]];
    display_value = this.document.analysis.normal_text.slice(
      wordS[0],
      wordE[1]
    );

    this.showAttributeInfo(
      idStart.split('_')[1],
      idEnd.split('_')[1],
      true,
      display_value
    );
  }

  showAttributeInfo(
    indexStart: number,
    indexEnd: number,
    editable: boolean,
    display_value?: string,
    kind?: string,
    value?: string
  ) {
    const dialogRef = this.dialog.open(EditAttributeComponent, {
      width: '50%',
      data: {
        //top: e.pageY,
        //left: e.pageX,
        display_value: display_value,
        kind: kind,
        value: value,
        documentType:
          kind && !editable
            ? this.documentType
            : this.documentType.filter(x => x.editable),
        editable: editable,
        attributes: this.attributes,
        indexStart: Number(indexStart),
        indexEnd: Number(indexEnd) + 1,
        editMode: this.editmode
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        document.body.classList.add('wait-cursor');
        this.attributes = result.attributes;
        this.changeAttribute.emit(result.attributes);
        this.changed = true;
        this.wait().then(x => {
          document.body.classList.remove('wait-cursor');
        });
      }
    });
  }

  wait() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.refreshView();
        resolve(true);
      }, 100);
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
      this.changed = false;
      this.refresh.emit();
    });
  }

  ngOnDestroy(): void {
    const elements = document.getElementsByClassName('hint');
    for (let i = 0; i < elements.length; i++) {
      elements[i].removeEventListener(
        'click',
        this.getInfoAttribute.bind(this)
      );
    }
  }
}
