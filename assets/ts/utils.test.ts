import { describe, expect, it } from 'vitest';
import { objectArrayToCsv, secondsToString } from './utils';

describe('secondsToString', () => {
  it('handles zero', () => {
    expect(secondsToString(0)).toBe('0 seconds');
  });

  it('uses singular and plural units', () => {
    expect(secondsToString(1)).toBe('1 second');
    expect(secondsToString(61)).toBe('1 minute, 1 second');
    expect(secondsToString(7200)).toBe('2 hours');
  });

  it('keeps only the two largest parts', () => {
    expect(secondsToString(31536000 + 604800 + 86400 + 3600)).toBe('1 year, 1 week');
  });
});

describe('objectArrayToCsv', () => {
  it('writes a header and rows', () => {
    expect(objectArrayToCsv([{ a: 1, b: 'x' }])).toBe('a,b\r\n1,x\r\n');
  });

  it('quotes commas and escapes every double quote', () => {
    expect(objectArrayToCsv([{ a: 'x,y' }])).toBe('a\r\n"x,y"\r\n');
    expect(objectArrayToCsv([{ a: 'say "hi" "you"' }])).toBe(
      'a\r\n"say ""hi"" ""you"""\r\n',
    );
  });

  it('quotes line breaks so a field stays on its row', () => {
    expect(objectArrayToCsv([{ a: 'x\ny' }])).toBe('a\r\n"x\ny"\r\n');
    expect(objectArrayToCsv([{ a: 'x\r\ny' }])).toBe('a\r\n"x\r\ny"\r\n');
  });

  it('returns nothing for an empty list', () => {
    expect(objectArrayToCsv([])).toBe('');
  });
});
