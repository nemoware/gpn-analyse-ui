import browser from 'browser-detect';
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { environment as env } from '@environments/environment';

import {
  authLogin,
  authLogout,
  AppState,
  LocalStorageService,
  selectIsAuthenticated,
  selectSettingsStickyHeader,
  selectEffectiveTheme
} from '@core/core.module';
import { AuthorizationData } from '@core/authorization/authorization.data';

@Component({
  selector: 'gpn-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isProd = env.production;
  envName = env.envName;
  version = env.versions.app;
  year = new Date().getFullYear();
  logo = require('@assets/new_logo_text_ru.svg');
  navigation : Array<{ link: string, label: string }> =
    [{ link: 'dash', label: 'Дэшборд' }];

  navigationSideMenu = [
    ...this.navigation,
    { link: 'settings', label: 'Настройки' }
  ];

  isAuthenticated$: Observable<boolean>;
  stickyHeader$: Observable<boolean>;
  theme$: Observable<string>;

  constructor(
    private store: Store<AppState>,
    private storageService: LocalStorageService,
    private authorizationData: AuthorizationData
  ) {}

  private static isIEorEdgeOrSafari() {
    return ['ie', 'edge', 'safari'].includes(browser().name);
  }

  ngOnInit(): void {
    this.storageService.testLocalStorage();
    this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
    this.stickyHeader$ = this.store.pipe(select(selectSettingsStickyHeader));
    this.theme$ = this.store.pipe(select(selectEffectiveTheme));
    this.authorizationData.getPermissions().subscribe( value => {
      this.navigation.push({ link: 'analyse', label: 'Анализ' });
      this.navigation.push({ link: 'admin', label: 'Администрирование' });
      this.navigation.push({ link: 'event', label: 'Журнал событий' });
    });
  }

  onLoginClick() {
    this.store.dispatch(authLogin());
  }

  onLogoutClick() {
    this.store.dispatch(authLogout());
  }

  getNameUser() {
    if (this.authorizationData.permissions)
      return this.authorizationData.permissions.name;
    else return '';
  }

  getRolesUser() {
    if (this.authorizationData.permissions)
      return this.authorizationData.permissions.roles;
    else return [];
  }

}
