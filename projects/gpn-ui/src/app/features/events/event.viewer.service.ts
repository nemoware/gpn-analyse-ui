import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from '@root/node_modules/rxjs';
import { DataSourceEvent, EventApp } from '@app/models/event.model';

const api = '/api';

@Injectable()
export class EventViewerService {
  constructor(private http: HttpClient) {}

  getEventsApp(
    filterVlaue: Array<{ name: string; value: any }>,
    take: number,
    pageIndex: number,
    column: string,
    sort: string
  ): Observable<DataSourceEvent> {
    let httpParams = new HttpParams();
    if (filterVlaue) {
      for (const filter of filterVlaue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }

    if (take) httpParams = httpParams.append('take', take.toString());
    if (pageIndex)
      httpParams = httpParams.append('skip', (pageIndex * take).toString());
    if (column) httpParams = httpParams.append('column', column.toString());
    if (sort) httpParams = httpParams.append('sort', sort.toString());

    return this.http.get<DataSourceEvent>(`${api}/logs`, {
      params: httpParams
    });
  }

  getEventsType(): Observable<Array<{ _id: string; name: string }>> {
    return this.http.get<Array<{ _id: string; name: string }>>(
      `${api}/eventTypes`
    );
  }
}
