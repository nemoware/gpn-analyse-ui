import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { DocumentInfo } from '@app/models/document-info';
import { Router } from '@root/node_modules/@angular/router';

@Component({
  selector: 'gpn-doc-info',
  templateUrl: './doc-info.component.html',
  styleUrls: ['./doc-info.component.scss']
})
export class DocInfoComponent implements OnInit {

  @Input('doc')
  doc: DocumentInfo

  constructor(private router: Router) { }

  ngOnInit() {
  }

  openDoc(){
    this.router.navigate(['/analyse/contract/', this.doc.id]);
  }

}
