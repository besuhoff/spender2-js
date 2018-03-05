import { HighlightPipe } from './highlight.pipe';

describe('HighlightPipe', () => {
  const pipe = new HighlightPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('highlight all matches', () => {
    pipe.transform('This is my Text and this is MY TEXTTEXTTEXT', 'text')
      .toBe('This is my <span class="highlighted">Text</span> and this is MY <span class="highlighted">TEXT</span>' +
        '<span class="highlighted">TEXT</span><span class="highlighted">TEXT</span>')
  });

  it('highlight by multiple criteria split by whitespace', () => {
    pipe.transform('This is my TEST and this is MY TEXT', 'text    test')
      .toBe('This is my <span class="highlighted">TEST</span> and this is MY <span class="highlighted">TEXT</span>')
  });});
