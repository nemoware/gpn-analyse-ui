import { Injectable } from '@angular/core';
import { AuthGroup } from '@app/models/permissions';
import { HttpClient } from '@root/node_modules/@angular/common/http';

const api = '/api';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationData {
  permissions: [{name: string, roles: Array<string>}];
  constructor(private http: HttpClient) {}

  hasPermission(authGroup: AuthGroup) {
    if (this.permissions && this.permissions[0].roles.find(permission => {
      return permission === authGroup;
    })) {
      return true;
    }
    return false;
  }

  getPermissions(){
    this.http.get<[{name: string, roles: Array<string>}]>(`${api}/permissionsuser`).subscribe(
      value =>  {
        this.permissions = value;
      }
    );
  }
}
