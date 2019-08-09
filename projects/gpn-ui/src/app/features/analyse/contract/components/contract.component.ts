import { Router } from '@angular/router';
import {Component, AfterViewInit, NgZone, ViewChild} from '@angular/core';
import { DocumentsSearchService } from '../../documents.service';
import { Observable } from 'rxjs';
import { LegalDocument, Tag } from '../../../../models/legal-document';
import { ViewDocComponent } from '@app/features/analyse/contract/components/view-doc.component';
import { DocumentInfo, KindTag } from '@app/models/document-info';
import { map } from '@root/node_modules/rxjs/internal/operators';

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
  documentInfo$: Observable<DocumentInfo>;
  contract: LegalDocument;
  tags : KindTag[];

  ngAfterViewInit() {
    console.warn('on init');
    this.loadDoc();
  }

  goToColorText(id: Tag) {
    this.view_doc.goToTag(id);
  }

  loadDoc() {
    this.documentInfo$ = this.searchService.getContract('2').
    pipe(
      map( value => {
        this.contract = JSON.parse(value.json_value) as LegalDocument;
        return value;
      }));
    this.loadTags();
  }

  loadTags() {
    const tags$ = this.searchService.getTags();
    tags$.subscribe( {next: value => { this.tags = value }});
  }

}
