import { Router } from '@angular/router';

import { Component, AfterViewInit, OnInit, NgZone } from '@angular/core';
import { DocumentsSearchService } from '../../documents.service';
import { Observable } from 'rxjs';
import { LegalDocument } from '../../../../models/legal-document';

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

  contract$: Observable<LegalDocument>;

  getDoc() {
    // TODO: use redux
    console.warn('on init');
    this.contract$ = this.searchService.getContract('contract id');
  }

  ngAfterViewInit() {
    this.getDoc();
  }
}
