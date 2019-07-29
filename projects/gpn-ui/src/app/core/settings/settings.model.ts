import { AppState } from '@core/core.module';


export interface SettingsState {
  theme: string;
  stickyHeader: boolean;
}

export interface State extends AppState {
  settings: SettingsState;
}
