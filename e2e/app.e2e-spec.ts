import { Spender2JsPage } from './app.po';

describe('spender2-js App', function() {
  let page: Spender2JsPage;

  beforeEach(() => {
    page = new Spender2JsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
