import { Router } from '@angular/router';

import {
  Component,
  AfterViewInit,
  OnInit,
  NgZone,
  ViewChild,
  ElementRef
} from '@angular/core';
import { DocumentsSearchService } from '../../documents.service';
import { Observable } from 'rxjs';
import { LegalDocument, Tag } from '../../../../models/legal-document';
import { ViewDocComponent } from '@app/features/analyse/contract/components/view-doc.component';

@Component({
  selector: 'gpn-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
  providers: [DocumentsSearchService]
})
export class ContractComponent implements AfterViewInit {
  constructor(
    private router: Router,
    private searchService: DocumentsSearchService,
    private _ngZone: NgZone
  ) {}
  @ViewChild(ViewDocComponent, { static: false }) view_doc: ViewDocComponent;
  contract$: Observable<LegalDocument>;

  getDoc() {
    console.warn('on init');
    this.contract$ = this.searchService!.getContract('contract id');
  }
  ngAfterViewInit() {
    this.getDoc();
  }

  goToColorText(id: Tag) {
    this.view_doc.goToTag(id);
  }
}
