import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { DocumentInfo, KindTag } from '@app/models/document-info';

const api = '/api';

@Injectable()
export class DocumentsSearchService {
  constructor(private http: HttpClient) {}

  getSearchResults (query: string, sort_by, sort_dir, page): Observable<DocumentInfo[]> {
    return this.http.get<DocumentInfo[]>(`${api}/contracts`);
  }

  getContract(contractId: string): Observable<DocumentInfo> {
    return this.http.get<DocumentInfo>(`${api}/contracts/` + contractId);
  }

  getTagTypes(): Observable<KindTag[]> {
    return this.http.get<KindTag[]>(`${api}/tag_types`);
  }

  getDocumTypes(): Observable<Array<{str_id: string, name: string}>> {
    return this.http.get<Array<{str_id: string, name: string}>>(`${api}/docum_types`);
  }

  getSearchContracts(filterVlaue : Array<{name: string, value: any}>, sort_by, sort_dir, page): Observable<DocumentInfo[]> {
    let httpParams = new HttpParams();
    if (filterVlaue)
      for (const filter of filterVlaue) {
        if (filter.value as [])
          httpParams = httpParams.append(filter.name, JSON.stringify(filter.value));
        else
          httpParams = httpParams.append(filter.name, filter.value);
      }
    httpParams = httpParams.append('sort_by', sort_by);
    httpParams = httpParams.append('sort_dir', sort_dir);
    httpParams = httpParams.append('page', page);
    return this.http.get<DocumentInfo[]>(`${api}/contracts/`, { params: httpParams });
  }
}

