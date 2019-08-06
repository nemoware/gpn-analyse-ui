import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewEncapsulation,
  ViewChild,
  ElementRef
} from '@angular/core';
import { LegalDocument, Tag } from '@app/models/legal-document';

@Component({
  selector: 'gpn-view-doc',
  templateUrl: './view-doc.component.html',
  styleUrls: ['./view-doc.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewDocComponent implements OnInit {
  loadedDoc = false;
  @Input() contract: LegalDocument;

  constructor() {}

  ngOnInit() {
    if (this.contract != null) this.loadDoc();
  }

  loadDoc() {
    const view_doc = document.getElementById('view_doc');
    let result = this.contract.normal_text;
    const words = this.contract.tokenization_maps['$words'];
    const infoTags: Array<[number, string]> = [];
    for (const _tag of this.contract.tags)
      for (let i = _tag.span[0]; i < _tag.span[1]; i++)
        infoTags.push([i, this.getClassName(_tag.kind)]);
    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i];
      const str_class = infoTags.find(x => x[0] === i)
        ? infoTags.find(x => x[0] === i)[1]
        : '';
      const txtS = `<span class="${this.getClassName(
        str_class
      )}" id="span_${i}">`;
      const txtE = '</span>';
      result = result.slice(0, word[1]) + txtE + result.slice(word[1]);
      result = result.slice(0, word[0]) + txtS + result.slice(word[0]);
    }
    result = '<span id="top"></span>' + result + '<span id="foot"> </span>';
    view_doc.insertAdjacentHTML('afterbegin', result);
    this.loadedDoc = true;
  }

  getClassName(kind: string) {
    let nameClassSpan = 'span';
    if (kind.includes('org') && kind.includes('2')) nameClassSpan = 'org_2';
    else if (kind.includes('org') && kind.includes('1'))
      nameClassSpan = 'org_1';
    else if (kind.includes('headline')) nameClassSpan = 'headline';
    return nameClassSpan;
  }

  public goToTag(tag: Tag) {
    this.goToColorText(`span_${tag.span[0]}`);
  }

  goToColorText(id) {
    const element = document.getElementById('view_doc');
    const elementC = element.getElementsByTagName('span');
    let elem = null;
    for (let i = 0; i < elementC.length; i++) {
      if (elementC[i].id === id) {
        elem = elementC[i];
        break;
      }
    }
    if (elem != null)
      elem.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
        inline: 'center'
      });
  }

  getSelectedText() {
    const words = this.contract.tokenization_maps['$words'];
    const elemS = document.getSelection().anchorNode.parentElement;
    const elemE = document.getSelection().focusNode.parentElement;
    const wordS = words[elemS.id.split('_')[1]];
    const wordE = words[elemE.id.split('_')[1]];
    const value = this.contract.normal_text.slice(wordS[0], wordE[1]);
    console.log(this.contract.normal_text);
    for (const elem of this.getArrayNodes(elemS, elemE)) {
      elem.classList.remove('span');
      elem.classList.add('headline');
    }
    this.addNewTag('headline', value, [
      Number(elemS.id.split('_')[1]),
      Number(elemE.id.split('_')[1])
    ]);
  }

  getArrayNodes(elemS: Element, elemE: Element): Array<Element> {
    const nodes: Array<Element> = [];
    let elem: Element = elemS;
    nodes.push(elemS);
    while (elem !== elemE) {
      elem = elem.nextElementSibling;
      nodes.push(elem);
    }
    return nodes;
  }

  addNewTag(kind: string, value: string, span: Array<number>) {
    const tag: Tag = { kind, value, span };
    this.contract.tags.push(tag);
  }
}
