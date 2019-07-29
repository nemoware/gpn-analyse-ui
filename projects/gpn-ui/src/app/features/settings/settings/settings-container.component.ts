import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import {

  actionSettingsChangeTheme,
  actionSettingsChangeStickyHeader
} from '@core/settings/settings.actions';
import { SettingsState, State } from '@core/settings/settings.model';
import { selectSettings } from '@core/settings/settings.selectors';

@Component({
  selector: 'gpn-settings',
  templateUrl: './settings-container.component.html',
  styleUrls: ['./settings-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsContainerComponent implements OnInit {
  settings$: Observable<SettingsState>;

  themes = [
    { value: 'DEFAULT-THEME', label: 'blue' },
    { value: 'LIGHT-THEME', label: 'light' },
    { value: 'NATURE-THEME', label: 'nature' },
    { value: 'BLACK-THEME', label: 'dark' }
  ];


  constructor(private store: Store<State>) { }

  ngOnInit() {
    this.settings$ = this.store.pipe(select(selectSettings));
  }


  onThemeSelect({ value: theme }) {
    this.store.dispatch(actionSettingsChangeTheme({ theme }));
  }


  onStickyHeaderToggle({ checked: stickyHeader }) {
    this.store.dispatch(actionSettingsChangeStickyHeader({ stickyHeader }));
  }



}
