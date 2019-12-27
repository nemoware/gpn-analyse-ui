import { Store, select } from '@ngrx/store';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';

import { selectIsAuthenticated } from '@core/core.module';

import { State } from '../analyse.state';

@Component({
  selector: 'gpn-analyse',
  templateUrl: './analyse.component.html',
  styleUrls: ['./analyse.component.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyseComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;

  analyse = [
    { link: 'search', label: 'Поиск' },
    { link: 'contract', label: 'Анализ' },
    { link: 'authenticated', label: 'Нечто еще', auth: true }
  ];

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.isAuthenticated$ = this.store.pipe(select(selectIsAuthenticated));
  }
}
