import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Audit, DataSourceAudit } from '@app/models/audit.model';
import { Subsidiary } from '@app/models/subsidiary.model';
import { Document } from '@app/models/document.model';
import { KindAttributeModel } from '@app/models/kind-attribute-model';
import { FileModel } from '@app/models/file-model';
import { LinksDocumentModel } from '@app/models/links-document-model';
import { ViolationModel } from '@app/models/violation-model';
import { ExportDocumentModel } from '@app/models/export-document.model';
import { ConclusionModel } from '@app/models/conclusion-model';

const api = '/api';

interface NotUsedDocuments {
  charter: { count: number; type: string };
  protocol: { count: number; type: string };
  annex: { count: number; type: string };
  supplementary_agreement: { count: number; type: string };
  contract: { count: number; type: string };
}
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

  public getListNotUsedDocuments(
    auditId: string
  ): Observable<NotUsedDocuments> {
    let httpParams = new HttpParams();

    if (auditId) {
      httpParams = httpParams.append('auditId', auditId);
    }
    return this.http.get<NotUsedDocuments>(`${api}/document/notusedlinks`, {
      params: httpParams
    });
  }

  public getNotUsedDocuments(
    auditId: string,
    documentType: string,
    take: number,
    pageIndex: number,
    column: string,
    sort: string
  ): Observable<{ arrOfRequiredContract: Document[]; count: number }> {
    let httpParams = new HttpParams();

    if (auditId) httpParams = httpParams.append('auditId', auditId);

    if (take) httpParams = httpParams.append('take', take.toString());

    if (take)
      httpParams = httpParams.append('skip', (pageIndex * take).toString());

    if (pageIndex)
      httpParams = httpParams.append('skip', (pageIndex * take).toString());

    if (column) httpParams = httpParams.append('column', column.toString());

    if (sort) httpParams = httpParams.append('sort', sort.toString());

    if (documentType)
      httpParams = httpParams.append('documentType', documentType.toString());

    return this.http.get<{ arrOfRequiredContract: Document[]; count: number }>(
      `${api}/document/notused`,
      {
        params: httpParams
      }
    );
  }

  public getTreeDocument(
    auditId: string,
    documentId: string,
    documentType: string,
    take: number,
    pageIndex: number,
    column: string,
    sort: string
  ): Observable<{ arrOfRequiredContract: Document[]; count: number }> {
    let httpParams = new HttpParams();

    if (auditId) httpParams = httpParams.append('auditId', auditId);

    if (take) httpParams = httpParams.append('take', take.toString());

    if (take)
      httpParams = httpParams.append('skip', (pageIndex * take).toString());

    if (pageIndex)
      httpParams = httpParams.append('skip', (pageIndex * take).toString());

    if (column) httpParams = httpParams.append('column', column.toString());

    if (sort) httpParams = httpParams.append('sort', sort.toString());

    if (documentId && documentType) {
      httpParams = httpParams.append('documentId', documentId.toString());
      httpParams = httpParams.append('documentType', documentType.toString());
    }

    return this.http.get<{ arrOfRequiredContract: Document[]; count: number }>(
      `${api}/document/treelist`,
      {
        params: httpParams
      }
    );
  }

  public getTreeLinks(
    documentId: string
  ): Observable<{
    Contract: Document[];
    SupplementaryAgreement: Document[];
    Annex: Document[];
  }> {
    let httpParams = new HttpParams();
    if (documentId) {
      httpParams = httpParams.append('documentId', documentId);
    }
    return this.http.get<{
      Contract: Document[];
      SupplementaryAgreement: Document[];
      Annex: Document[];
    }>(`${api}/document/treelinks`, {
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

  public updateDocument(
    id: string,
    attributes: {},
    documentType
  ): Observable<Document> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('_id', id);
    return this.http.put<Document>(
      `${api}/document`,
      { user: attributes, documentType },
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

  public setInside(id: string, action: boolean) {
    return this.http.put(
      `${api}/document/setInside`,
      { id: id, action: action },
      { responseType: 'text' as 'json' }
    );
  }

  public exportConclusion(
    id: string,
    selectedRows
  ): Observable<ExportDocumentModel> {
    return this.http.post<ExportDocumentModel>(
      `${api}/audit/exportConclusion`,
      { id, selectedRows }
    );
  }

  public getConclusion(id: string): Observable<ConclusionModel> {
    let httpParams = new HttpParams();
    httpParams = httpParams.append('id', id);
    return this.http.get<ConclusionModel>(`${api}/audit/conclusion`, {
      params: httpParams
    });
  }
  public postSelectedViolations(
    id: string,
    selectedRows: ViolationModel[]
  ): Observable<any> {
    return this.http.put<ViolationModel[]>(
      `${api}/audit/selectedViolations`,
      { id, selectedRows },
      { responseType: 'text' as 'json' }
    );
  }

  public postConclusion(
    id: string,
    conclusion: ConclusionModel
  ): Observable<any> {
    return this.http.put<ConclusionModel>(
      `${api}/audit/conclusion`,
      { id, conclusion },
      { responseType: 'text' as 'json' }
    );
  }

  fetch(
    filterValue: Array<{ name: string; value: any }>,
    take: number,
    pageIndex: number,
    column: string,
    sort: string
  ): Observable<DataSourceAudit> {
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

    return this.http.get<DataSourceAudit>(`${api}/audit/fetch`, {
      params: httpParams
    });
  }
}
