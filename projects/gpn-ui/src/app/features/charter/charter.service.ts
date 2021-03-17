import { Injectable } from '@angular/core';
import { Observable } from '@root/node_modules/rxjs';
import { Document } from '@app/models/document.model';
import {
  HttpClient,
  HttpParams
} from '@root/node_modules/@angular/common/http';
import { Charter, DataSourceCharter } from '@app/models/charter.model';

const api = '/api';

@Injectable({
  providedIn: 'root'
})
export class CharterService {
  constructor(private http: HttpClient) {}

  public getCharters(
    filterValue: Array<{ name: string; value: any }> = null
  ): Observable<Charter[]> {
    let httpParams = new HttpParams();
    if (filterValue) {
      for (const filter of filterValue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    return this.http.get<Array<Charter>>(`${api}/document/charter-table`, {
      params: httpParams
    });
  }

  public postCharter(charter): Observable<any> {
    return this.http.post<Document>(`${api}/document/charters`, charter);
  }

  fetch(
    filterValue: Array<{ name: string; value: any }>,
    take: number,
    pageIndex: number,
    column: string,
    sort: string,
    showInactive: boolean
  ): Observable<DataSourceCharter> {
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
    httpParams = httpParams.append(
      'showInactive',
      (showInactive && true).toString()
    );

    return this.http.get<DataSourceCharter>(`${api}/document/fetchCharters`, {
      params: httpParams
    });
  }
}
