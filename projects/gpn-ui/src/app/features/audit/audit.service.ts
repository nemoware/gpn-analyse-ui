import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Audit } from '@app/models/audit.model';
import { Subsidiary } from '@app/models/subsidiary.model';
import { Document } from '@app/models/document.model';
import { KindAttributeModel } from '@app/models/kind-attribute-model';
import { FileModel } from '@app/models/file-model';
import { LinksDocumentModel } from '@app/models/links-document-model';
import { ViolationModel } from '@app/models/violation-model';

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
    return this.http.get<Array<Audit>>(`${api}/audit/list`, {
      params: httpParams
    });
  }

  public getSubsidiaries(): Observable<Subsidiary[]> {
    return this.http.get<Array<Subsidiary>>(`${api}/audit/subsidiaries`);
  }

  public postAudit(audit: any): Observable<Subsidiary> {
    return this.http.post<Subsidiary>(`${api}/audit`, audit);
  }

  deleteAudit(id: string) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/audit`, { params: urlParams });
  }

  public getDouments(
    auditId: string = null,
    full: boolean = null
  ): Observable<Document[]> {
    let httpParams = new HttpParams();
    if (auditId) {
      httpParams = httpParams.append('auditId', auditId);
    }
    if (full != null && !full) {
      httpParams = httpParams.append('full', 'false');
    }
    return this.http.get<Array<Document>>(`${api}/document/list`, {
      params: httpParams
    });
  }

  public getFiles(auditId: string = null): Observable<FileModel[]> {
    let httpParams = new HttpParams();
    if (auditId) {
      httpParams = httpParams.append('auditId', auditId);
    }
    return this.http.get<Array<FileModel>>(`${api}/audit/files`, {
      params: httpParams
    });
  }

  public getDoument(id: string): Observable<Document> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('id', id);
    return this.http.get<Document>(`${api}/document`, { params: httpParams });
  }

  public getDoumentTypeAtr(name: string): Observable<KindAttributeModel[]> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('name', name);
    return this.http.get<KindAttributeModel[]>(`${api}/document/attributes`, {
      params: httpParams
    });
  }

  public updateDocument(id: string, attributes: {}): Observable<Document> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('_id', id);
    return this.http.put<Document>(
      `${api}/document`,
      { user: attributes },
      { params: httpParams }
    );
  }

  public getLinkDocuments(id: string): Observable<Array<LinksDocumentModel>> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('documentId', id);
    return this.http.get<Array<LinksDocumentModel>>(`${api}/document/links`, {
      params: httpParams
    });
  }

  public getDocumentsByType(
    auditId: string,
    type: string
  ): Observable<Array<LinksDocumentModel>> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('auditId', auditId);
    httpParams = httpParams.append('type', type);
    return this.http.get<Array<LinksDocumentModel>>(
      `${api}/document/list-by-type`,
      {
        params: httpParams
      }
    );
  }

  public postLinks(link: { fromId: string; toId: string }): Observable<any> {
    return this.http.post(`${api}/document/link`, link, {
      responseType: 'text' as 'json'
    });
  }

  public deleteLinks(fromId: string, toId: string) {
    let urlParams = new HttpParams();
    urlParams = urlParams.append('fromId', fromId);
    urlParams = urlParams.append('toId', toId);
    return this.http.delete(`${api}/document/link`, { params: urlParams });
  }

  public getViolations(id: string): Observable<Array<ViolationModel>> {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.get<Array<ViolationModel>>(`${api}/audit/violations`, {
      params: urlParams
    });
  }

  public postApprove(id: string): Observable<any> {
    return this.http.post<Array<ViolationModel>>(
      `${api}/audit/approve`,
      { id: id },
      { responseType: 'text' as 'json' }
    );
  }

  deleteStart(id: string) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/document/star`, {
      params: urlParams,
      responseType: 'text' as 'json'
    });
  }

  public postStar(id: string) {
    return this.http.post(
      `${api}/document/star`,
      { id: id },
      { responseType: 'text' as 'json' }
    );
  }

  public getCharter(name?): Observable<Array<ViolationModel>> {
    let urlParams = new HttpParams();
    if (name) urlParams = urlParams.append('name', name);
    return this.http.get<Array<ViolationModel>>(`${api}/document/charters`, {
      params: urlParams
    });
  }

  public deactivateCharter(id: string, action: boolean) {
    return this.http.put(
      `${api}/document/activate-charter`,
      { id: id, action: action },
      { responseType: 'text' as 'json' }
    );
  }
}
