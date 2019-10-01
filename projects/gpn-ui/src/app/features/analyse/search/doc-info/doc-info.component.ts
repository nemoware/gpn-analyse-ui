import { Component, OnInit, Input } from '@angular/core';
import { DocumentInfo } from '@app/models/document-info';

@Component({
  selector: 'gpn-doc-info',
  templateUrl: './doc-info.component.html',
  styleUrls: ['./doc-info.component.scss']
})
export class DocInfoComponent implements OnInit {
  @Input()
  doc: DocumentInfo;

  constructor() {}

  ngOnInit() {}
}
