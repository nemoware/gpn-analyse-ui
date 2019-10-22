import browser from 'browser-detect';
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { environment as env } from '@environments/environment';
import { HideDirective } from '../core/authorization/hide.directive';

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
import { TranslateService } from '@root/node_modules/@ngx-translate/core';

@Component({
  selector: 'gpn-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isProd = env.production;
  envName = env.envName;
  version = env.versions.app;
  loadedUser = false;
  year = new Date().getFullYear();
  logo = require('@assets/new_logo_text_ru.svg');
  navigation = [
    { link: 'audit', label: 'Аудит' },
    { link: 'dash', label: 'Дэшборд' },
    { link: 'analyse', label: 'Анализ' },
    { link: 'admin', label: 'Администрирование' }
    //{ link: 'events', label: 'Журнал событий' }
  ];

  navigationSideMenu = [
    ...this.navigation,
    { link: 'settings', label: 'Настройки' }
  ];

  isAuthenticated$: Observable<boolean>;
  stickyHeader$: Observable<boolean>;

  constructor(
    private store: Store<AppState>,
    private storageService: LocalStorageService,
    private authorizationData: AuthorizationData,
    public translate: TranslateService
  ) {
    translate.addLangs(['en', 'ru']);
    translate.setDefaultLang('ru');
    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|ru/) ? browserLang : 'en');
  }

  private static isIEorEdgeOrSafari() {
    return ['ie', 'edge', 'safari'].includes(browser().name);
  }

  ngOnInit(): void {
    this.storageService.testLocalStorage();
    this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
    this.stickyHeader$ = this.store.pipe(select(selectSettingsStickyHeader));
    this.authorizationData.getUserInfo().subscribe(value => {
      if (value) this.loadedUser = true;
    });
  }

  getNameUser() {
    if (this.authorizationData.userInfo)
      return this.authorizationData.userInfo.name;
    else return '';
  }

  getRolesUser() {
    if (this.authorizationData.userInfo)
      return this.authorizationData.userInfo.roles;
    else return [];
  }
}
