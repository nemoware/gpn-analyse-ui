import { By } from '@angular/platform-browser';
import { MatSlideToggle } from '@angular/material';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';
import { provideMockStore, MockStore } from '@ngrx/store/testing';

import { SharedModule } from '@shared/shared.module';

import { SettingsContainerComponent } from './settings-container.component';
import {
  actionSettingsChangeTheme,
  actionSettingsChangeStickyHeader
} from '@core/settings/settings.actions';

describe('SettingsComponent', () => {
  let component: SettingsContainerComponent;
  let fixture: ComponentFixture<SettingsContainerComponent>;
  let store: MockStore<any>;
  let dispatchSpy;

  const getThemeSelectArrow = () =>
    fixture.debugElement.queryAll(By.css('.mat-select-trigger'))[1];
  const getSelectOptions = () =>
    fixture.debugElement.queryAll(By.css('mat-option'));

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      providers: [
        provideMockStore({
          initialState: {
            settings: {}
          }
        })
      ],
      declarations: [SettingsContainerComponent]
    }).compileComponents();

    store = TestBed.get(Store);
    fixture = TestBed.createComponent(SettingsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should dispatch change sticky header on sticky header toggle', () => {
    dispatchSpy = spyOn(store, 'dispatch');
    const componentDebug = fixture.debugElement;
    const slider = componentDebug.queryAll(By.directive(MatSlideToggle))[0];

    slider.triggerEventHandler('change', { checked: false });
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      actionSettingsChangeStickyHeader({ stickyHeader: false })
    );
  });

  /*it('should dispatch change theme action on theme selection', () => {
    dispatchSpy = spyOn(store, 'dispatch');
    getThemeSelectArrow().triggerEventHandler('click', {});

    fixture.detectChanges();

    getSelectOptions()[1].triggerEventHandler('click', {});

    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      actionSettingsChangeTheme({ theme: 'LIGHT-THEME' })
    );
  });*/

  /*it('should dispatch change auto night mode on night mode toggle', () => {
    dispatchSpy = spyOn(store, 'dispatch');
    const componentDebug = fixture.debugElement;
    const slider = componentDebug.queryAll(By.directive(MatSlideToggle))[1];

    slider.triggerEventHandler('change', { checked: false });
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);

  });*/

  /*it('should dispatch change animations page', () => {
    dispatchSpy = spyOn(store, 'dispatch');
    const componentDebug = fixture.debugElement;
    const slider = componentDebug.queryAll(By.directive(MatSlideToggle))[2];

    slider.triggerEventHandler('change', { checked: false });
    fixture.detectChanges();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);

  });*/
});
