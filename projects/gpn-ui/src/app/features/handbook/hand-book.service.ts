import { Injectable } from '@angular/core';

import { RiskMatrix } from '@app/models/riskMatrix.model';
import {
  HttpClient,
  HttpParams
} from '@root/node_modules/@angular/common/http';
import { Observable } from '@root/node_modules/rxjs';
import { LimitValue } from '@app/models/limitValue.model';
import { BookValue } from '@app/models/bookValue';
import { DataSourceAffiliates } from '@app/models/affiliates.model';

const api = '/api';

@Injectable({
  providedIn: 'root'
})
export class HandBookService {
  constructor(private http: HttpClient) {}

  public getRiskMatrix(): Observable<RiskMatrix[]> {
    return this.http.get<Array<RiskMatrix>>(`${api}/handbook/riskMatrix`);
  }

  public deleteRisk(id: string) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/handbook/riskMatrix`, {
      params: urlParams
    });
  }

  public postRisk(risk: any): Observable<RiskMatrix> {
    return this.http.post<RiskMatrix>(`${api}/handbook/riskMatrix`, risk);
  }

  public updateRisk(risk: any): Observable<RiskMatrix> {
    return this.http.put<RiskMatrix>(`${api}/handbook/riskMatrix`, risk);
  }

  public getLimitValues(): Observable<LimitValue[]> {
    return this.http.get<Array<LimitValue>>(`${api}/handbook/limitValues`);
  }

  public deleteLimitValue(id: string) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/handbook/limitValues`, {
      params: urlParams
    });
  }

  public postLimitValue(limitValue: any): Observable<LimitValue> {
    return this.http.post<LimitValue>(
      `${api}/handbook/limitValues`,
      limitValue
    );
  }

  public updateLimitValue(limitValue: any): Observable<LimitValue> {
    return this.http.put<LimitValue>(`${api}/handbook/limitValues`, limitValue);
  }

  public getViolationTypes(): Observable<any[]> {
    return this.http.get<Array<any>>(`${api}/handbook/violationTypes`);
  }

  public getBookValues(): Observable<BookValue[]> {
    return this.http.get<Array<BookValue>>(`${api}/handbook/bookValues`);
  }

  public deleteBookValue(id: string) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/handbook/bookValues`, {
      params: urlParams
    });
  }

  public postBookValue(bookValue: any): Observable<BookValue> {
    return this.http.post<BookValue>(`${api}/handbook/bookValues`, bookValue);
  }

  public updateBookValue(bookValue: any): Observable<BookValue> {
    return this.http.put<BookValue>(`${api}/handbook/bookValues`, bookValue);
  }

  public postAffiliatesList(document: Object): Observable<any> {
    return this.http.post<Observable<any>>(
      `${api}/handbook/affiliatesList`,
      document
    );
  }

  fetchAffiliates(
    filterValue: Array<{ name: string; value: any }>,
    take: number,
    pageIndex: number,
    column: string,
    sort: string
  ): Observable<DataSourceAffiliates> {
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

    return this.http.get<DataSourceAffiliates>(
      `${api}/handbook/fetchAffiliates`,
      {
        params: httpParams
      }
    );
  }
}
