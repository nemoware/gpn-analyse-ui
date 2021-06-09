import { Component, Input, OnInit } from '@angular/core';
import { Document } from '@app/models/document.model';

@Component({
  selector: 'gpn-doc-state',
  templateUrl: './doc-state.component.html',
  styleUrls: ['./doc-state.component.scss']
})
export class DocStateComponent implements OnInit {
  ngOnInit(): void {
    console.log('Статус');
    console.log(this.document);
  }
  @Input() document: Document;

  getDocStateClass(doc) {
    return 'state state-' + doc.state;
  }
}
