import { Injectable } from '@angular/core';
import { AuthGroup } from '@app/models/permissions';
import { HttpClient } from '@root/node_modules/@angular/common/http';
import { Observable } from '@root/node_modules/rxjs';
import { map } from '@root/node_modules/rxjs/internal/operators';
import { AppPages } from '@app/models/app.pages';

const api = '/api';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationData {
  permissions: {name: string, roles: Array<{name: string, app_page: string, description: string}>};
  constructor(private http: HttpClient) {}

  hasRole(authGroup: AuthGroup) {
    if (this.permissions && this.permissions.roles.find(permission => {
      return permission.name === authGroup;
    })) {
      return true;
    }
    return false;
  }

  hasAccess(authGroup: string) {
    if (!(authGroup in AppPages)) return true;
    if (this.permissions && this.permissions.roles.find(permission => {
      return permission.app_page === authGroup;
    })) {
      return true;
    }
    return false;
  }

  getPermissions() : Observable<{name: string, roles: Array<{name: string, app_page: string, description: string}>}> {
    return this.http.get<{name: string, roles: Array<{name: string, app_page: string, description: string}>}>
    (`${api}/permissionsuser`).
    pipe(map( value => { console.log(value); this.permissions = value; return value; }))
  }
}
