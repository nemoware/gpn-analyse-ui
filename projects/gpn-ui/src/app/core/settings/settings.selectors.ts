import { createSelector } from '@ngrx/store';

import { SettingsState } from './settings.model';
import { selectSettingsState } from '@core/core.state';

export const selectSettings = createSelector(
  selectSettingsState,
  (state: SettingsState) => state
);

export const selectSettingsStickyHeader = createSelector(
  selectSettings,
  (state: SettingsState) => state.stickyHeader
);

 

export const selectTheme = createSelector(
  selectSettings,
  settings => settings.theme
);

 

export const selectEffectiveTheme = createSelector(
  selectTheme,
  (theme) =>
    (theme).toLowerCase()
);
