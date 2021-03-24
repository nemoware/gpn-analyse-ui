import browser from 'browser-detect';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
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
import { Dictionaries } from '@app/models/dictionaries';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'gpn-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  isProd = env.production;
  envName = env.envName;
  version = env.versions.app;
  loadedUser = false;
  year = new Date().getFullYear();
  logo = require('@assets/new_logo_text_ru.svg');
  navigation = [
    { link: 'pre-audit', label: 'Предпроверка' },
    { link: 'audit', label: 'Проверка' },
    { link: 'charter', label: 'Уставы' },
    { link: 'handbook', label: 'Справочники' },
    // { link: 'dash', label: 'Дэшборд' },
    // { link: 'analyse', label: 'Анализ' },
    { link: 'admin', label: 'Администрирование' },
    { link: 'events', label: 'Журнал событий' }
  ];

  navigationSideMenu = [
    ...this.navigation /*,
    { link: 'settings', label: 'Настройки' }*/
  ];

  handbookMenu = [
    { link: 'riskMatrix', label: 'Матрица рисков' },
    { link: 'limitValues', label: 'Предельные значения' }
  ];

  isAuthenticated$: Observable<boolean>;
  stickyHeader$: Observable<boolean>;
  private destroyStream = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private storageService: LocalStorageService,
    private authorizationData: AuthorizationData,
    public translate: TranslateService
  ) {
    translate.addLangs(['en', 'ru']);
    translate.setDefaultLang('ru');
    //const browserLang = translate.getBrowserLang();
    //translate.use(browserLang.match(/en|ru/) ? browserLang : 'en');
    translate.use('ru');
  }

  private static isIEorEdgeOrSafari() {
    return ['ie', 'edge', 'safari'].includes(browser().name);
  }

  ngOnInit(): void {
    this.storageService.testLocalStorage();
    this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
    this.stickyHeader$ = this.store.pipe(select(selectSettingsStickyHeader));
    this.authorizationData
      .getUserInfo()
      .pipe(takeUntil(this.destroyStream))
      .subscribe(value => {
        if (value) this.loadedUser = true;
      });
    this.authorizationData.getRobotState().subscribe(data => {
      env.robotState = data.state;
    });
  }

  getNameUser() {
    if (this.authorizationData.userInfo)
      return this.authorizationData.userInfo.name;
    else return '';
  }

  getEmailUser() {
    if (this.authorizationData.userInfo) {
      return this.authorizationData.userInfo.userPrincipalName;
    } else return '';
  }

  getRolesUser() {
    if (this.authorizationData.userInfo)
      return this.authorizationData.userInfo.roles;
    else return [];
  }

  ngOnDestroy(): void {
    this.destroyStream.next();
  }
}
