import { Injectable } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { merge } from 'rxjs';
import { tap, distinctUntilChanged, filter } from 'rxjs/operators';

import { TitleService, AppState } from '@core/core.module';

@Injectable()
export class AnalyseEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private router: Router,
    private titleService: TitleService
  ) {}

  setTitle = createEffect(
    () =>
      merge(
        this.router.events.pipe(filter(event => event instanceof ActivationEnd))
      ).pipe(
        tap(() => {
          this.titleService.setTitle(this.router.routerState.snapshot.root);
        })
      ),
    { dispatch: false }
  );
}
