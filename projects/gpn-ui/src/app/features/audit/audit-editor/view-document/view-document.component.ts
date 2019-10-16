import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  Input,
  ViewEncapsulation
} from '@angular/core';
import { Document } from '@app/models/document.model';
import { Helper } from '@app/features/audit/helper';
import { Tag } from '@app/models/legal-document';
import { KindAttribute } from '@app/models/kind-attribute';

@Component({
  selector: 'gpn-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ViewDocumentComponent implements OnInit, AfterViewInit {
  @Input() document: Document;
  @Input() editmode: boolean;
  constructor() {}

  ngOnInit() {
    if (this.document) this.loadDoc();
  }

  ngAfterViewInit(): void {}

  loadDoc() {
    const view_doc = document.getElementById('view_doc');
    let result = this.document.analysis.normal_text;
    const words = this.document.analysis.tokenization_maps.words;
    const infoTags: Array<[number, string]> = [];
    const _atr = Helper.json2array(this.document.analysis.attributes);

    for (const _tag of _atr)
      if (_tag.span) {
        for (let i = _tag.span[0]; i < _tag.span[1]; i++)
          infoTags.push([i, this.getClassName(_tag.kind)]);
      }
    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      let classSpan;
      const _tag = infoTags.find(x => x[0] === i);
      if (_tag) classSpan = _tag[1];
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

  public goToColorText(id) {
    const element = document.getElementById(id);
    if (element != null)
      element.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
  }

  getSelectedText() {
    if (!this.editmode) return;
    let idStart;
    let idEnd;

    if (document.getSelection().anchorNode.parentElement.id === 'view_doc') {
      idStart = (document.getSelection().anchorNode.nextSibling as HTMLElement)
        .id;
    } else idStart = document.getSelection().anchorNode.parentElement.id;

    if (document.getSelection().focusNode.parentElement.id === 'view_doc') {
      idEnd = (document.getSelection().focusNode.previousSibling as HTMLElement)
        .id;
    } else idEnd = document.getSelection().focusNode.parentElement.id;

    if (Number(idStart.split('_')[1]) > Number(idEnd.split('_')[1])) return;

    for (const elem of this.getArrayNodes(idStart, idEnd)) {
      elem.classList.forEach(c => {
        elem.classList.remove(c);
      });
      elem.classList.add('selected');
    }

    const words = this.document.analysis.tokenization_maps.words;
    const wordS = words[idStart.split('_')[1]];
    const wordE = words[idEnd.split('_')[1]];

    const value = this.document.analysis.normal_text.slice(wordS[0], wordE[1]);

    this.addNewTag('selected', value, [
      Number(idStart.split('_')[1]),
      Number(idEnd.split('_')[1])
    ]);
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

  addNewTag(kind: string, value: string, span: Array<number>) {
    const tag: Tag = { kind, value, span };
    // this.contract.tags.push(tag);
  }
}
