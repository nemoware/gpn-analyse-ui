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

import { Router } from '@root/node_modules/@angular/router';
import { MatDialog } from '@root/node_modules/@angular/material';
import { EditAttributeComponent } from '@app/features/audit/audit-editor/edit-attribute/edit-attribute.component';
import { AuditService } from '@app/features/audit/audit.service';
import { AttributeModel } from '@app/models/attribute-model';
import { KindAttributeModel } from '@app/models/kind-attribute-model';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { NgxSpinnerService } from '@root/node_modules/ngx-spinner';
import { Observable, Observer } from '@root/node_modules/rxjs';
import { Helper } from '@app/features/audit/helper';

@Component({
  selector: 'gpn-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ViewDocumentComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() selectedAttribute: string;
  @Input() document: Document;
  @Input() editmode: boolean;
  @Input() kinds: KindAttributeModel[];
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
    document
      .getElementById('view_doc')
      .addEventListener('click', this.getInfoAttribute.bind(this));
  }

  ngAfterViewInit(): void {
    this.auditservice
      .getDoumentTypeAtr(this.document.documentType)
      .subscribe(docType => {
        this.kinds = docType;
      });
  }

  refreshView(attributes?: Array<AttributeModel>) {
    this.spinner.show();
    if (attributes) this.attributes = attributes;

    const myObservables = new Observable((observer: Observer<string>) => {
      setTimeout(() => {
        observer.next(
          this.wrapWords(
            this.attributes,
            this.document.analysis.tokenization_maps.words,
            this.document.analysis.normal_text
          )
        );
      }, 50);
    });

    const customSubscrition = myObservables.subscribe(
      (response: string) => {
        const view_doc = document.getElementById('view_doc');
        if (view_doc.innerHTML) view_doc.innerHTML = response;
        else view_doc.insertAdjacentHTML('afterbegin', response);
        customSubscrition.unsubscribe();

        /*let i = 0;
        view_doc.querySelectorAll(':scope >*').forEach(x => x.id = (i++).toString());*/

        for (const atr of this.document.analysis.headers) {
          this.setAttribute(atr.span[0], atr.span[1], 'headline', false);
        }

        const sortedAttributes = this.attributes.sort((a, b) => {
          if (!a.parent && !b.parent) return 0;
          else if (a.parent && !b.parent) return 1;
          else if (!a.parent && b.parent) return -1;
          else if (a.parent.length > b.parent.length) return 1;
          else if (a.parent.length < b.parent.length) return -1;
          else if (a.parent.length === b.parent.length) return 0;
        });

        for (const atr of sortedAttributes) {
          this.setAttribute(
            atr.span[0],
            atr.span[1],
            atr.kind,
            true,
            atr.key,
            atr.changed
          );
        }

        this.spinner.hide();

        if (this.selectedAttribute) {
          this.goToAttribute(this.selectedAttribute);
        }
      },
      (error: string) => {
        console.log('FAILURE RESPONSE: ', error);
      }
    );
  }

  wrapWords(
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
    return '<span id="top"></span>' + result + '<span id ="foot"></span>';
  }

  setAttribute(
    indexStart: number,
    indexEnd: number,
    kind: string,
    needHint: boolean,
    key?: string,
    changed?: boolean
  ) {
    if (indexStart === indexEnd || !kind || kind.length === 0) return;

    const span = document.createElement('span');
    span.classList.add(kind);
    if (needHint) span.classList.add('hint_span');
    if (key) span.id = key;
    const startWord = document.getElementById('span_' + indexStart);

    if (indexStart !== indexEnd - 1) {
      const endWord = this.checkEndWord(indexEnd);
      const range = document.createRange();
      range.setStart(startWord, 0);
      range.setEnd(endWord, 0);
      startWord.parentElement.insertBefore(span, startWord);
      span.appendChild(range.extractContents());
      range.insertNode(span);
      if (
        span.previousElementSibling &&
        span.previousElementSibling.textContent === ''
      )
        span.previousElementSibling.remove();
      if (span.children[span.children.length - 1])
        span.children[span.children.length - 1].remove();
    } else {
      startWord.parentElement.insertBefore(span, startWord);
      span.appendChild(startWord);
    }

    if (needHint) {
      const spanHint = document.createElement('span');
      spanHint.insertAdjacentText('afterbegin', this.translate.instant(kind));
      spanHint.classList.add('hint');
      if (this.editmode) spanHint.classList.add('hint_pointer');
      if (changed) spanHint.classList.add('changed');
      span.appendChild(spanHint);
    }
  }

  checkEndWord(id: number): Node {
    const elem = document.getElementById('span_' + id);
    const elemPrev = document.getElementById('span_' + (id - 1));
    if (elemPrev.innerHTML === '\n') return this.checkEndWord(id - 1);
    else return elem;
  }

  removeAttribute(atr: AttributeModel) {
    const element = document.getElementById(atr.key);
    this.removeElement(element);
    console.log(this.attributes);
  }

  removeElement(element) {
    if (element.hasChildNodes())
      element
        .querySelectorAll(':scope > .hint_span')
        .forEach(x => this.removeElement(x));
    //element.childNodes.forEach( x => this.removeElement(x));
    element.lastChild.remove();
    element.insertAdjacentHTML('beforebegin', element.innerHTML);
    element.remove();
    this.attributes = this.attributes.filter(x => x.key !== element.id);
  }

  getInfoAttribute(e) {
    if (e.target.classList.contains('hint') && this.editmode) {
      const atr = this.attributes.find(
        x => x.key === e.target.parentElement.id
      );
      const atrParent = this.attributes.find(x => x.key === atr.parent);
      this.showAttributeInfo(atr, atrParent);
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
        block: 'center',
        behavior: 'smooth'
      });
  }

  getSelectedText(e: MouseEvent) {
    if (!this.editmode || e.button > 0 || window.getSelection().isCollapsed)
      return;

    let atrParent: AttributeModel = null;
    const atr: AttributeModel = {
      confidence: 0,
      key: null,
      kind: '',
      num: 0,
      parent: '',
      span: [],
      span_map: 'words',
      value: ''
    };

    const selRange = window.getSelection().getRangeAt(0);
    if (
      !selRange.endContainer.parentElement.id ||
      !selRange.startContainer.parentElement.id
    )
      return;

    const startElement =
      selRange.startContainer.nodeValue !== ' '
        ? document.getElementById(selRange.startContainer.parentElement.id)
        : document.getElementById(
            (selRange.startContainer.nextSibling as HTMLElement).id
          );

    const endElement =
      selRange.endContainer.nodeValue !== ' '
        ? document.getElementById(selRange.endContainer.parentElement.id)
        : document.getElementById(
            (selRange.endContainer.previousSibling as HTMLElement).id
          );

    if (!startElement || !endElement) return;

    if (startElement.parentElement.id !== 'view_doc') {
      atrParent = this.attributes.find(
        x => x.key === startElement.parentElement.id
      );
      if (atrParent) atr.parent = atrParent.key;
    }

    if (endElement.parentElement.id !== startElement.parentElement.id) {
      alert('Пересечение атрибутов не допустимо!');
      return;
    }

    atr.span = [
      Number(startElement.id.split('_')[1]),
      Number(endElement.id.split('_')[1]) + 1
    ];
    this.showAttributeInfo(atr, atrParent);
  }

  getKindOfAttributes(
    atrParent: AttributeModel,
    selectKind = ''
  ): KindAttributeModel[] {
    const onceAttribute = [];

    if (!atrParent) {
      this.attributes.forEach(x => {
        const a = this.kinds.find(
          y => y.kind === x.kind && y.kind !== selectKind
        );
        if (a && a.once) onceAttribute.push(a.kind);
      });
      return this.kinds.filter(x => !onceAttribute.includes(x.kind));
    } else if (atrParent) {
      const parents = [];
      for (const p of atrParent.key.split('/')) {
        parents.push(Helper.parseKind(p).kind);
      }
      let atr = null;

      for (const p of parents) {
        if (atr) atr = atr.children.find(x => x.kind === p);
        else atr = this.kinds.find(x => x.kind === p);
      }
      if (!atr.children) return null;
      this.attributes
        .filter(x => x.parent === atrParent.key)
        .forEach(x => {
          const a = atr.children.find(
            y => y.kind === x.kind && y.kind !== selectKind
          );
          if (a && a.once) onceAttribute.push(a.kind);
        });

      return atr.children.filter(x => !onceAttribute.includes(x.kind));
    }
  }

  showAttributeInfo(atr: AttributeModel, atrParent: AttributeModel) {
    const newAtr: AttributeModel = {
      confidence: atr.confidence,
      key: atr.key,
      kind: atr.kind,
      num: atr.num,
      parent: atr.parent,
      span: atr.span,
      span_map: atr.span_map,
      value: atr.value
    };

    const _kinds = this.getKindOfAttributes(atrParent, atr.kind);
    if (atrParent && (!_kinds || _kinds.length === 0)) return;

    const dialogRef = this.dialog.open(EditAttributeComponent, {
      width: '50%',
      data: {
        displayValue: this.document.analysis.normal_text.slice(
          this.document.analysis.tokenization_maps.words[atr.span[0]][0],
          this.document.analysis.tokenization_maps.words[atr.span[1] - 1][1]
        ),
        value: newAtr.value ? newAtr.value.toString() : null,
        kind: newAtr.kind,
        key: newAtr.key,
        atrParent: atrParent,
        kinds: _kinds
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.delete) {
          this.removeAttribute(atr);
        } else {
          newAtr.kind = result.kind;
          newAtr.value = result.value;
          newAtr.changed = true;

          if (newAtr.key) {
            this.removeAttribute(atr);
          }

          newAtr.key = this.getNumAttribute(
            atrParent ? atrParent.key : null,
            newAtr.kind
          );

          this.attributes.push(newAtr);
          this.setAttribute(
            newAtr.span[0],
            newAtr.span[1],
            newAtr.kind,
            true,
            newAtr.key,
            true
          );
          console.log(this.attributes);
        }
        this.changeAttribute.emit(this.attributes);
      }
    });
  }

  getNumAttribute(parentKey: string, kind: string): string {
    let N = 0;
    if (parentKey) {
      const parentKind = Helper.parseKind(parentKey).kind;
      N = this.attributes
        .filter(x => x.kind === parentKind)
        .filter(x => x.kind === kind).length;
    } else N = this.attributes.filter(x => x.kind === kind).length;
    return (
      (parentKey ? parentKey + '/' : '') + kind + (N > 0 ? '-' + (N + 1) : '')
    );
  }

  saveChanges() {
    const atr = {};
    this.attributes.forEach(
      item =>
        (atr[item.key] = {
          confidence: item.confidence,
          kind: item.key,
          span: item.span,
          span_map: item.span_map,
          value: item.value,
          changed: item.changed,
          parent: item.parent
        })
    );

    this.auditservice.updateDocument(this.document._id, atr).subscribe(data => {
      this.changed = false;
      this.refresh.emit();
    });
  }

  ngOnDestroy(): void {
    document
      .getElementById('view_doc')
      .removeEventListener('click', this.getInfoAttribute.bind(this));
  }
}
