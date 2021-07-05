import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@root/node_modules/@angular/common/http';
import { Observable } from '@root/node_modules/rxjs';
import { Audit } from '@app/models/audit.model';
import { RelevanceModel } from '@app/models/relevance.model';

const api = '/api';

@Injectable({
  providedIn: 'root'
})
export class PreAuditService {
  constructor(private http: HttpClient) {}

  public postPreAudit(documents: Object[], checkTypes): Observable<any> {
    return this.http.post<Observable<any>>(`${api}/preAudit/uploadFiles`, {
      documents,
      checkTypes
    });
  }

  fetch(
    filterValue: Array<{ name: string; value: any }>,
    take: number,
    pageIndex: number,
    column: string,
    sort: string
  ): Observable<PreAuditService> {
    let httpParams = new HttpParams();
    if (filterValue) {
      for (const filter of filterValue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    if (take) httpParams = httpParams.append('take', take.toString());
    if (pageIndex)
      httpParams = httpParams.append('skip', (pageIndex * take).toString());
    if (column) httpParams = httpParams.append('column', column.toString());
    if (sort) httpParams = httpParams.append('sort', sort.toString());

    return this.http.get<PreAuditService>(`${api}/preAudit/fetchPreAudits`, {
      params: httpParams
    });
  }

  public getAudits(
    filterValue: Array<{ name: string; value: any }> = null
  ): Observable<Audit> {
    let httpParams = new HttpParams();
    if (filterValue) {
      for (const filter of filterValue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    return this.http.get<Audit>(`${api}/preAudit/list`, {
      params: httpParams
    });
  }

  getPreAuditRelevance(): Observable<RelevanceModel> {
    return this.http.get<RelevanceModel>(`${api}/preAudit/relevance`, {});
  }
}
