import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GroupInfo } from '@app/models/group.model';
import { Observable, throwError } from '@root/node_modules/rxjs';
import { catchError, map } from 'rxjs/operators';
import { RoleInfo } from '@app/models/role.model';
import { Audit } from '@app/models/audit.model';

const api = '/api';

@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}

  getRoles(): Observable<Array<RoleInfo>> {
    return this.http.get<Array<RoleInfo>>(`${api}/admin/roles`);
  }

  getGroupsApp(
    filterVlaue: Array<{ name: string; value: any }> = null
  ): Observable<GroupInfo[]> {
    let httpParams = new HttpParams();
    if (filterVlaue) {
      for (const filter of filterVlaue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    return this.http.get<Array<GroupInfo>>(`${api}/admin/groups`, {
      params: httpParams
    });
  }

  getADGroup(
    filterVlaue: Array<{ name: string; value: any }> = null
  ): Observable<any> {
    let httpParams = new HttpParams();
    if (filterVlaue) {
      for (const filter of filterVlaue) {
        httpParams = httpParams.append(filter.name, filter.value);
      }
    }
    return this.http.get<Array<GroupInfo>>(`${api}/admin/ad/groups`, {
      params: httpParams
    });
  }

  createGroup(cn: string, distinguishedName: string): Observable<GroupInfo> {
    return this.http.post<GroupInfo>(`${api}/admin/group`, {
      cn: cn,
      distinguishedName: distinguishedName
    });
  }

  updateGroup(id: string, group: GroupInfo) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.put(`${api}/admin/group`, group, { params: urlParams });
  }

  deleteGroup(id: string) {
    const urlParams = new HttpParams().set('id', id.toString());
    return this.http.delete(`${api}/admin/group`, { params: urlParams });
  }
}
