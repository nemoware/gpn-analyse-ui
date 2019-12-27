import * as assert from 'assert';
import { ActivationEnd } from '@angular/router';
import { Actions, getEffectsMetadata } from '@ngrx/effects';

import { Store } from '@ngrx/store';
import { TestScheduler } from 'rxjs/testing';

import { TitleService } from '@core/core.module';

import { AnalyseEffects } from './analyse.effects';
import { State } from '@app/features/analyse/analyse.state';

const scheduler = new TestScheduler((actual, expected) =>
  assert.deepStrictEqual(actual, expected)
);

describe('SettingsEffects', () => {
  let router: any;
  let titleService: jasmine.SpyObj<TitleService>;

  let store: jasmine.SpyObj<Store<State>>;

  beforeEach(() => {
    router = {
      routerState: {
        snapshot: {
          root: {}
        }
      },
      events: {
        pipe() {}
      }
    };

    titleService = jasmine.createSpyObj('TitleService', ['setTitle']);
    store = jasmine.createSpyObj('store', ['pipe']);
  });

  describe('setTitle', () => {
    it('should not dispatch action', () => {
      const actions = new Actions<any>();
      const effect = new AnalyseEffects(actions, store, router, titleService);
      const metadata = getEffectsMetadata(effect);

      expect(metadata.setTitle.dispatch).toEqual(false);
    });
  });
});
