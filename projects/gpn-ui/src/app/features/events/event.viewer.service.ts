import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from '@root/node_modules/rxjs';
import { EventApp } from '@app/models/event.model';

const api = '/api';

@Injectable()
export class EventViewerService {
  constructor(private http: HttpClient) {}

  getEventsApp(
    filterVlaue: Array<{ name: string; value: any }>
  ): Observable<EventApp[]> {
    let httpParams = new HttpParams();
    if (filterVlaue) {
      for (const filter of filterVlaue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }

    console.log(httpParams);

    return this.http.get<EventApp[]>(`${api}/eventApp`, {
      params: httpParams
    });
  }

  getEventsType(): Observable<Array<{ _id: string; name: string }>> {
    return this.http.get<Array<{ _id: string; name: string }>>(
      `${api}/eventType`
    );
  }
}
