import {
  actionSettingsChangeStickyHeader,
  actionSettingsChangeTheme
} from './settings.actions';
import { Action, createReducer, on } from '@ngrx/store';
import { SettingsState } from './settings.model';

export const initialState: SettingsState = {
  theme: 'DEFAULT-THEME',
  stickyHeader: true
};

const reducer = createReducer(
  initialState,
  on(
    actionSettingsChangeTheme,
    actionSettingsChangeStickyHeader,

    (state, action) => ({ ...state, ...action })
  )
);

export function settingsReducer(
  state: SettingsState | undefined,
  action: Action
) {
  return reducer(state, action);
}
