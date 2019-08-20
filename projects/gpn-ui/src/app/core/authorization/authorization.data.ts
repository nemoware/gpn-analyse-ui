import { Injectable } from '@angular/core';
import { AuthGroup } from '@app/models/permissions';
import { HttpClient } from '@root/node_modules/@angular/common/http';

const api = '/api';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationData {
  permissions: Array<{name: string}>;
  constructor(private http: HttpClient) {}

  hasPermission(authGroup: AuthGroup) {
    if (this.permissions && this.permissions.find(permission => {
      return permission.name === authGroup;
    })) {
      return true;
    }
    return false;
  }

  getPermissions(){
    this.http.get<Array<{name: string}>>(`${api}/permissionsuser`).subscribe(
      value =>  {
        this.permissions = value;
      }
    );
  }
}
