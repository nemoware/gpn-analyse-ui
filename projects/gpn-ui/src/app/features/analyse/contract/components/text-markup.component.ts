import { Component, Input } from '@angular/core';
import { LegalDocument, Tag } from '../../../../models/legal-document';

@Component({
  selector: 'gpn-text-markup',
  styleUrls: ['./text-markup.component.scss'],
  template:
    '<span *ngFor="let token of getTokens()" class="{{token[1]}}" >{{ token[0] }} </span>'
})
export class TextMarkupComponent {
  constructor() {}

  @Input()
  doc: LegalDocument;

  tokens: Array<Array<number | string>> = [];

  getTokens() {
    this.tokens = [];
    if (!this.doc) {
      return;
    }

    const _map = this.doc.tokenization_maps['$words'];
    const _text: string = this.doc.normal_text;
    const _tags: Array<Tag> = this.doc.tags;

    const tokens: Array<Array<number | string>> = [];
    let i = 0;
    for (const span of _map) {
      const token = _text.slice(span[0], span[1]);
      const clazz = token === '\n' ? 'tag_br ' : '';
      tokens[i] = [];
      tokens[i][0] = token;
      tokens[i][1] = clazz;
      i += 1;
    }

    // console.log(tokens);
    for (const tag of _tags) {
      const _start_i = tag.span[0];
      const _stop_i = tag.span[1];

      for (let k = _start_i; k < _stop_i; k++) {
        if (tokens[k])
          tokens[k][1] += 'tag_default tag_' + tag.kind.split('.').join('_');
        // TODO:
        else console.error('no token for ' + k);
      }
    }

    this.tokens = tokens;
    return tokens;
  }
}
