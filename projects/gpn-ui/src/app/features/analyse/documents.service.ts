import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { DocumentInfo } from '@app/models/document-info';
import { LegalDocument } from '@app/models/legal-document';

const httpOptions = {
  headers: new HttpHeaders({
    'x-refresh': 'true'
  })
};

@Injectable()
export class DocumentsSearchService {
  constructor(private http: HttpClient) {}

  getSearchResults(
    query: string,
    sort_by,
    sort_dir,
    page
  ): Observable<DocumentInfo[]> {
    //TODO: replace with API call
    const _url = '/assets/list_documents.json';

    const params = new HttpParams({ fromObject: { q: query } });
    const options = { httpOptions, params };

    return this.http.get<DocumentInfo[]>(_url, options);
  }

  getContract(contractId: string): Observable<LegalDocument> {
    //TODO: replace with API call
    const _url = '/assets/contract.json';
    const params = new HttpParams({ fromObject: { q: contractId } });
    const options = { httpOptions, params };

    return this.http.get<LegalDocument>(_url, options);
  }
}
