import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Audit } from '@app/models/audit.model';
import { Subsidiary } from '@app/models/subsidiary.model';
import { DocumentParser } from '@app/models/document.model';

const api = '/api';

@Injectable()
export class AuditService {
  constructor(private http: HttpClient) {}

  public getAudits(
    filterVlaue: Array<{ name: string; value: any }> = null
  ): Observable<Audit[]> {
    let httpParams = new HttpParams();
    if (filterVlaue) {
      for (const filter of filterVlaue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    return this.http.get<Array<Audit>>(`${api}/audits`, { params: httpParams });
  }

  public getSubsidiaries(): Observable<Subsidiary[]> {
    return this.http.get<Array<Subsidiary>>(`${api}/subsidiaries`);
  }

  public postAudit(audit: any): Observable<Subsidiary> {
    return this.http.post<Subsidiary>(`${api}/audit`, audit);
  }

  deleteAudit(id: string) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/audit`, { params: urlParams });
  }

  public getDoumentsParser(
    auditId: string = null
  ): Observable<DocumentParser[]> {
    let httpParams = new HttpParams();
    if (auditId) {
      httpParams = httpParams.append('auditId', auditId);
    }
    return this.http.get<Array<DocumentParser>>(`${api}/documents`, {
      params: httpParams
    });
  }
}
