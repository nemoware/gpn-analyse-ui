import { AppPage } from './app.po';


describe('App', () => {
  let page: AppPage;

  beforeEach(() => (page = new AppPage()));

  it('empty menu', () => {
    page.navigateTo();
    page.getAllMenus().then(menus => expect(menus).length === 0);
  });
});
