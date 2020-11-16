import { Injectable } from '@angular/core';

import { RiskMatrix } from '@app/models/riskMatrix.model';
import {
  HttpClient,
  HttpParams
} from '@root/node_modules/@angular/common/http';
import { Observable } from '@root/node_modules/rxjs';

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
}
