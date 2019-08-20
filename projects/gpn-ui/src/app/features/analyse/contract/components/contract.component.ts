import { ActivatedRoute, Router } from '@angular/router';
import { Component, AfterViewInit, NgZone, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { DocumentsSearchService } from '../../documents.service';
import { Observable } from 'rxjs';
import { LegalDocument, Tag } from '../../../../models/legal-document';
import { ViewDocComponent } from '@app/features/analyse/contract/components/view-doc/view-doc.component';
import { DocumentInfo, KindTag } from '@app/models/document-info';
import { map } from '@root/node_modules/rxjs/internal/operators';

@Component({
  selector: 'gpn-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
  providers: [DocumentsSearchService]
})
export class ContractComponent implements AfterViewInit, OnInit {

  constructor(
    private router: Router,
    private searchService: DocumentsSearchService,
    private changeDetectorRefs: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute
  ) {}

  isLoading = true;
  ID = '0';
  @ViewChild(ViewDocComponent, { static: false }) view_doc: ViewDocComponent;
  documentInfo$: Observable<DocumentInfo>;
  contract: LegalDocument;
  tags : KindTag[];

  ngOnInit(): void {
      this.ID = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngAfterViewInit() {
    console.warn('on init');
    this.loadDoc();
  }

  goToColorText(id: Tag) {
    this.view_doc.goToTag(id);
  }

  loadDoc() {
    this.isLoading = true;
    this.documentInfo$ = this.searchService.getContract(this.ID).
    pipe(
      map( value => {
        this.contract = JSON.parse(value.json_value) as LegalDocument;
        this.isLoading = false;
        return value;
      }));
    this.loadTags();
    this.changeDetectorRefs.detectChanges();
  }

  loadTags() {
    const tags$ = this.searchService.getTagTypes();
    tags$.subscribe( {next: value => { this.tags = value }});
  }

}
