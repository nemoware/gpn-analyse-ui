import browser from 'browser-detect';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { environment as env } from '@environments/environment';

import {
  AppState,
  LocalStorageService,
  selectIsAuthenticated,
  selectSettingsStickyHeader
} from '@core/core.module';
import { AuthorizationData } from '@core/authorization/authorization.data';
import { TranslateService } from '@root/node_modules/@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import {
  Router,
  NavigationStart,
  Event as NavigationEvent
} from '@root/node_modules/@angular/router';

@Component({
  selector: 'gpn-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  version = env.versions.app;
  loadedUser = false;
  year = new Date().getFullYear();
  isActive = false;
  logo = require('@assets/new_logo_text_ru.svg');
  navigation = [
    { link: 'pre-audit', label: 'Предпроверка ДД' },
    { link: 'audit', label: 'Проверка ДО' },
    { link: 'charter', label: 'Уставы' },
    { link: 'handbook', label: 'Справочники' },
    { link: 'admin', label: 'Администрирование' },
    { link: 'events', label: 'Журнал событий' }
  ];

  navigationSideMenu = [...this.navigation];

  handbookMenu = [
    { link: 'riskMatrix', label: 'Матрица рисков' },
    { link: 'limitValues', label: 'Предельные значения' },
    { link: 'bookValues', label: 'Балансовая стоимость' },
    { link: 'affiliatesList', label: 'Список аффилированных лиц' }
  ];

  isAuthenticated$: Observable<boolean>;
  stickyHeader$: Observable<boolean>;
  private destroyStream = new Subject<void>();
  constructor(
    private store: Store<AppState>,
    private storageService: LocalStorageService,
    private authorizationData: AuthorizationData,
    public translate: TranslateService,
    private router: Router
  ) {
    translate.addLangs(['en', 'ru']);
    translate.setDefaultLang('ru');
    translate.use('ru');
  }

  ngOnInit(): void {
    //Получаем текущую ссылку и подсвечиваем вкладку, если открыто меню справочников
    this.router.events
      .pipe(takeUntil(this.destroyStream))
      .subscribe((event: NavigationEvent) => {
        if (event instanceof NavigationStart) {
          this.isActive = !!this.handbookMenu.find(
            item => item.link === event.url.split('/')[1]
          );
        }
      });
    this.storageService.testLocalStorage();
    this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
    this.stickyHeader$ = this.store.pipe(select(selectSettingsStickyHeader));
    this.authorizationData
      .getUserInfo()
      .pipe(takeUntil(this.destroyStream))
      .subscribe(value => {
        if (value) this.loadedUser = true;
      });
    //Запуск приложения с роботами?
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

  openWindow(item) {
    window.open(window.location.origin + '/#/' + item.link, '_blank');
  }
}
