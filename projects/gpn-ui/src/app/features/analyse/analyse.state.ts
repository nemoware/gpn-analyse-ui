import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';

import { AppState } from '@core/core.module';

export const FEATURE_NAME = 'analyse';
export const selectAnalyse = createFeatureSelector<State, AnalyseState>(
  FEATURE_NAME
);

export const reducers: ActionReducerMap<AnalyseState> = {};

export interface AnalyseState {}

export interface State extends AppState {
  analyse: AnalyseState;
}
