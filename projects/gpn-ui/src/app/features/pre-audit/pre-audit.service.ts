import { Injectable } from '@angular/core';
import { HttpClient } from '@root/node_modules/@angular/common/http';
import { Observable } from '@root/node_modules/rxjs';

const api = '/api';

@Injectable({
  providedIn: 'root'
})
export class PreAuditService {
  constructor(private http: HttpClient) {}

  public postPreAudit(documents: Object[]): Observable<any> {
    return this.http.post<Observable<any>>(
      `${api}/audit/uploadFiles`,
      documents
    );
  }
}
