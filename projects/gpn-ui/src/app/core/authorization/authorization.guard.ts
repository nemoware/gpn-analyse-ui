import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  RouterStateSnapshot, UrlTree
} from '@root/node_modules/@angular/router';
import { Observable } from '@root/node_modules/rxjs';
import { Injectable } from '@root/node_modules/@angular/core';

import { AuthorizationData } from '@core/authorization/authorization.data';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor (private authorizationData: AuthorizationData) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authorizationData.hasAccess('admin')) {
      return true;
    }
    else {
      return false;
    }
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }

}
