import { Injectable } from '@angular/core';

import { RiskMatrix } from '@app/models/riskMatrix.model';
import {
  HttpClient,
  HttpParams
} from '@root/node_modules/@angular/common/http';
import { Observable } from '@root/node_modules/rxjs';
import { LimitValue } from '@app/models/limitValue.model';

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
}
