import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserInfo } from '@app/models/user.model';
import { Observable, throwError } from '@root/node_modules/rxjs';
import { catchError, map } from 'rxjs/operators';
import { RoleInfo } from '@app/models/role.model';
import { Audit } from '@app/models/audit.model';

const api = '/api';

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}

  getRoles(): Observable<Array<RoleInfo>> {
    return this.http.get<Array<RoleInfo>>(`${api}/roles`);
  }

  getUsersApp(
    filterVlaue: Array<{ name: string; value: any }> = null
  ): Observable<UserInfo[]> {
    let httpParams = new HttpParams();
    if (filterVlaue) {
      for (const filter of filterVlaue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    return this.http.get<Array<UserInfo>>(`${api}/appUsers`, {
      params: httpParams
    });
  }

  getUsersGroup(
    filterVlaue: Array<{ name: string; value: any }> = null
  ): Observable<any> {
    let httpParams = new HttpParams();
    if (filterVlaue) {
      for (const filter of filterVlaue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    return this.http.get<Array<UserInfo>>(`${api}/groupUsers`, {
      params: httpParams
    });
  }

  createUser(login: string): Observable<UserInfo> {
    return this.http.post<UserInfo>(`${api}/user`, { login: login });
  }

  updateUser(id: string, user: UserInfo) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.put(`${api}/user`, user, { params: urlParams });
  }

  deleteUser(id: string) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/user`, { params: urlParams });
  }
}
