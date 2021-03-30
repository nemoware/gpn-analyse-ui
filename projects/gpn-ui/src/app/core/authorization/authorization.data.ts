import { Injectable } from '@angular/core';
import { HttpClient } from '@root/node_modules/@angular/common/http';
import { Observable } from '@root/node_modules/rxjs';
import { map } from 'rxjs/operators';
import { AppPages } from '@app/models/app.pages';
import { UserInfo } from '@app/models/user.model';

const api = '/api';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationData {
  userInfo: UserInfo;
  constructor(private http: HttpClient) {}

  hasAccess(authPage: string) {
    if (!(authPage in AppPages)) return true;
    if (
      this.userInfo &&
      this.userInfo.roles.find(role => {
        return (
          role.appPage === authPage ||
          (role.appPage === 'audit' &&
            (authPage === 'charter' || authPage === 'handbook'))
        );
      })
    ) {
      return true;
    }
    return false;
  }

  getUserInfo(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${api}/account/user`).pipe(
      map(value => {
        this.userInfo = value;
        return value;
      })
    );
  }

  public getRobotState(): Observable<{ state: boolean }> {
    return this.http.get<{ state: boolean }>(`${api}/audit/robot`);
  }
}
