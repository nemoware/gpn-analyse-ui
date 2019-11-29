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
import { KindAttributeModel } from '@app/models/kind-attribute-model';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';
import { Observable, Observer } from '@root/node_modules/rxjs';

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
  loading = false;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private changeDetectorRefs: ChangeDetectorRef,
    private auditservice: AuditService,
    private translate: TranslateService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    console.log(this.attributes);
    this.refreshView();
  }

  ngAfterViewInit(): void {
    this.auditservice
      .getDoumentTypeAtr(this.document.documentType)
      .subscribe(docType => {
        this.documentType = docType;
      });
  }

  refreshView(attributes?: Array<AttributeModel>) {
    this.spinner.show();
    if (attributes) this.attributes = attributes;
    if (this.editmode) {
      const elementsH = document.getElementsByClassName('hint');
      for (let i = 0; i < elementsH.length; i++) {
        elementsH[i].removeEventListener(
          'click',
          this.getInfoAttribute.bind(this)
        );
      }
    }
    const myObservables = Observable.create((observer: Observer<string>) => {
      setTimeout(() => {
        observer.next(
          this.genTextByWords(
            this.attributes,
            this.document.analysis.tokenization_maps.words,
            this.document.analysis.normal_text
          )
        );
      }, 10);
    });

    const customSubscrition = myObservables.subscribe(
      (response: string) => {
        const view_doc = document.getElementById('view_doc');
        if (view_doc.innerHTML) view_doc.innerHTML = response;
        else view_doc.insertAdjacentHTML('afterbegin', response);
        customSubscrition.unsubscribe();

        const sortedAttributes = this.attributes.sort((a, b) => {
          if (!a.parent && !b.parent) return 0;
          else if (a.parent && !b.parent) return 1;
          else if (!a.parent && b.parent) return -1;
          else if (a.parent.length > b.parent.length) return 1;
          else if (a.parent.length < b.parent.length) return -1;
          else if (a.parent.length === b.parent.length) return 0;
        });

        for (const atr of sortedAttributes) {
          this.setTextAttribue(atr);
        }

        if (this.editmode) {
          const elements = document.getElementsByClassName('hint');
          for (let i = 0; i < elements.length; i++) {
            elements[i].addEventListener(
              'click',
              this.getInfoAttribute.bind(this)
            );
          }
        }

        this.spinner.hide();
      },
      (error: string) => {
        console.log('FAILURE RESPONSE: ', error);
      }
    );
  }

  setTextAttribue(atr: AttributeModel) {
    /*const firstWord = document.getElementById('span_' + indexStart);
    const endWord = document.getElementById('span_' + indexStart);
    const parentNode = firstWord.parentElement;
    parentNode.insertBefore(span, firstWord);
    span.appendChild(firstWord);
    console.log(firstWord);*/

    const span = document.createElement('span');
    span.classList.add(atr.kind);
    span.classList.add('hint_span');
    const startWord = document.getElementById('span_' + atr.span[0]);

    if (atr.span[0] !== atr.span[1] - 1) {
      const endWord = document.getElementById('span_' + atr.span[1]);
      const range = document.createRange();
      range.setStart(startWord, 0);
      range.setEnd(endWord, 0);
      startWord.parentElement.insertBefore(span, startWord);
      span.appendChild(range.extractContents());
      range.insertNode(span);
      span.previousElementSibling.remove();
      span.children[span.children.length - 1].remove();
    } else {
      startWord.parentElement.insertBefore(span, startWord);
      span.appendChild(startWord);
    }

    const spanHint = document.createElement('span');
    spanHint.insertAdjacentText('afterbegin', this.translate.instant(atr.kind));
    spanHint.classList.add('hint');
    span.appendChild(spanHint);

    /*
    for (let i = atr.span[0]; i < atr.span[1]; i++) {
      range.selectNode(document.getElementById('span_' + i));
      console.log(range);

      const parentNode = nextWord.parentElement;
      parentNode.insertBefore(span, nextWord);
      span.appendChild(nextWord);
    }*/
  }

  genTextByWords(
    attributes: Array<AttributeModel>,
    words: [[number, number]],
    normal_text: string
  ) {
    let result = normal_text;

    for (let i = words.length - 1; i >= 0; i--) {
      const word = normal_text.slice(words[i][0], words[i][1]);
      result =
        result.slice(0, words[i][0]) +
        `<span id = "span_${i}">` +
        word +
        '</span>' +
        result.slice(words[i][1]);
    }

    return result;

    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      let tagStart = '';
      let tagEnd = '';
      let headerStart = '';
      let headerEnd = '';

      const _atr = attributes.find(
        x => (x.span[0] === i || x.span[1] - 1 === i) && x.span[0] !== x.span[1]
      );
      if (_atr) {
        if (_atr.span[0] === i) {
          tagStart = `<span class="${_atr.kind} hint_span">`;
        }
        if (_atr.span[1] - 1 === i) {
          tagEnd = `<span class="hint" style="cursor: ${
            this.editmode ? 'pointer' : 'default'
          }"> ${this.translate.instant(_atr.kind)} </span></span>`;
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
    return result;
  }

  getInfoAttribute(e) {
    const _atr = this.attributes.find(
      x => x.kind === e.target.parentElement.classList[0]
    );
    if (_atr) {
      this.showAttributeInfo(
        _atr.span[0],
        _atr.span[1] - 1,
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

  public goToAttribute(id) {
    const element = document.getElementById(id);
    if (element != null)
      element.scrollIntoView({
        block: 'start',
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
      display_value
    );
  }

  showAttributeInfo(
    indexStart: number,
    indexEnd: number,
    display_value?: string,
    kind?: string,
    value?: string
  ) {
    if (!this.editmode) return;

    const dialogRef = this.dialog.open(EditAttributeComponent, {
      width: '50%',
      data: {
        //top: e.pageY,
        //left: e.pageX,
        display_value: display_value,
        kind: kind,
        value: value,
        documentType: this.documentType,
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
        this.wait(result.attributes).then(x => {
          document.body.classList.remove('wait-cursor');
        });
      }
    });
  }

  wait(attributes?: Array<AttributeModel>) {
    return new Promise(resolve => {
      setTimeout(() => {
        this.refreshView(attributes);
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
