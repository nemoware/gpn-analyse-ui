import {
  actionSettingsChangeAnimationsElements,
  actionSettingsChangeAnimationsPage,
  actionSettingsChangeAnimationsPageDisabled,
  actionSettingsChangeStickyHeader,
  actionSettingsChangeTheme
} from './settings.actions';
 

describe('Settings Actions', () => {
   

  it('should create ActionSettingsChangeAnimationsElements action', () => {
    const action = actionSettingsChangeAnimationsElements({
      elementsAnimations: true
    });

    expect(action.type).toEqual(actionSettingsChangeAnimationsElements.type);
    expect(action.elementsAnimations).toEqual(true);
  });

  it('should create ActionSettingsChangeAnimationsPage action', () => {
    const action = actionSettingsChangeAnimationsPage({
      pageAnimations: true
    });

    expect(action.type).toEqual(actionSettingsChangeAnimationsPage.type);
    expect(action.pageAnimations).toEqual(true);
  });

  it('should create ActionSettingsChangeAnimationsPageDisabled action', () => {
    const action = actionSettingsChangeAnimationsPageDisabled({
      pageAnimationsDisabled: true
    });

    expect(action.type).toEqual(
      actionSettingsChangeAnimationsPageDisabled.type
    );
    expect(action.pageAnimationsDisabled).toEqual(true);
  });

   

  it('should create ActionSettingsChangeStickyHeader action', () => {
    const action = actionSettingsChangeStickyHeader({
      stickyHeader: true
    });

    expect(action.type).toEqual(actionSettingsChangeStickyHeader.type);
    expect(action.stickyHeader).toEqual(true);
  });

 
});
