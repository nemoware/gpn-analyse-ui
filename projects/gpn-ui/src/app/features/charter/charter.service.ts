import { Injectable } from '@angular/core';
import { Observable } from '@root/node_modules/rxjs';
import { Document } from '@app/models/document.model';
import {
  HttpClient,
  HttpParams
} from '@root/node_modules/@angular/common/http';

const api = '/api';

@Injectable({
  providedIn: 'root'
})
export class CharterService {
  constructor(private http: HttpClient) {}

  public getCharters(
    filterValue: Array<{ name: string; value: any }> = null
  ): Observable<Document[]> {
    let httpParams = new HttpParams();
    if (filterValue) {
      for (const filter of filterValue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    return this.http.get<Array<Document>>(`${api}/document/charter-table`, {
      params: httpParams
    });
  }

  public deactivateCharter(id: string, action: boolean) {
    return this.http.put(
      `${api}/document/activate-charter`,
      { id: id, action: action },
      { responseType: 'text' as 'json' }
    );
  }

  public postCharter(charter): Observable<Document> {
    return this.http.post<Document>(`${api}/document/charters`, charter);
  }
}
