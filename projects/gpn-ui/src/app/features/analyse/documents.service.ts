import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { DocumentInfo, KindTag } from '@app/models/document-info';
import { LegalDocument, Tag } from '@app/models/legal-document';

const httpOptions = {
  headers: new HttpHeaders({
    'x-refresh': 'true'
  })
};
const api = '/api';

@Injectable()
export class DocumentsSearchService {
  constructor(private http: HttpClient) {}

  getSearchResults (query: string, sort_by, sort_dir, page): Observable<DocumentInfo[]> {
    return null;
  }

  getContract(contractId: string): Observable<DocumentInfo> {
    return this.http.get<DocumentInfo>(`${api}/contracts/` + contractId);
  }

  getTags(): Observable<KindTag[]> {
    return this.http.get<KindTag[]>(`${api}/tags`);
  }
}

