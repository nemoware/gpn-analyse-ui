import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable, throwError } from '@root/node_modules/rxjs';
import { catchError, map } from '@root/node_modules/rxjs/internal/operators';
import { EventApp } from '@app/models/event.model';
import { DocumentInfo } from '@app/models/document-info';

const api = '/api';

@Injectable()
export class EventViewerService {

  constructor(private http: HttpClient){ }

  getEventsApp(filterVlaue : Array<{name: string, value: any}>, sort_by, sort_dir, page) : Observable<EventApp[]> {
    let httpParams = new HttpParams();
    if (filterVlaue)
      for (const filter of filterVlaue) {
        if (filter.value as [])
          httpParams = httpParams.append(filter.name, JSON.stringify(filter.value));
        else
          httpParams = httpParams.append(filter.name, filter.value);
      }
    httpParams = httpParams.append('sort_by', sort_by);
    httpParams = httpParams.append('sort_dir', sort_dir);
    httpParams = httpParams.append('page', page);
    return this.http.get<EventApp[]>(`${api}/eventsapp`, { params: httpParams });
  }

  getEventsType() : Observable<Array<{id: string, name: string}>> {
    return this.http.get<Array<{id: string, name: string}>>(`${api}/events`);
  }

}
