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
    const _url = '/assets/roles.json';
    return this.http.get<RoleInfo[]>(_url);
    // return this.http.get<Array<RoleInfo>>(`${api}/permissions`);
  }

  getPermissionsUser(id: number): Observable<Array<number>> {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.get<Array<number>>(`${api}/permissionsuserid`, {
      params: urlParams
    });
  }

  getUsersApp(
    filterVlaue: Array<{ name: string; value: any }> = null
  ): Observable<UserInfo[]> {
    /*
    let httpParams = new HttpParams();
    if (filterVlaue) {
      for (const filter of filterVlaue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    return this.http.get<Array<Audit>>(`${api}/users`, { params: httpParams });*/

    // return this.http.get<UserInfo[]>(`${api}/users`);
    const _url = '/assets/users.json';
    return this.http.get<UserInfo[]>(_url);
  }

  getUsersGroup(
    filterVlaue: Array<{ name: string; value: any }> = null
  ): Observable<any> {
    const _url = '/assets/users_group.json';
    return this.http.get<UserInfo[]>(_url);
    // return this.http.get<any>(`${api}/get_users`).pipe(map(value => { return value; }), catchError( err => { return throwError(err); }));
  }

  createUser(user: UserInfo): Observable<UserInfo> {
    return this.http.post<UserInfo>(`${api}/users`, user);
  }

  updateUser(id: number, user: UserInfo) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.put(`${api}/users`, user, { params: urlParams });
  }

  deleteUser(id: string) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/users`, { params: urlParams });
  }

  saveRoles(
    id_user: number,
    roles: Array<{ id: string; status: string }>
  ): any {
    let urlParams = new HttpParams().set('roles', JSON.stringify(roles));
    urlParams = urlParams.set('id_user', id_user.toString());
    return this.http.get(`${api}/save_roles`, { params: urlParams });
  }
}
