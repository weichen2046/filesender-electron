import { FilesenderPage } from './app.po';

describe('filesender App', function() {
  let page: FilesenderPage;

  beforeEach(() => {
    page = new FilesenderPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
