import { TextFormatter } from '../formatters/TextFormatter';
import { MarkdownFormatter } from '../formatters/MarkdownFormatter';
import { JsonFormatter } from '../formatters/JsonFormatter';
import { LogFormatter } from '../formatters/LogFormatter';
import type { ParsedPdfData, DigestOptions } from '../types';

const makeData = (text: string, numpages = 1): ParsedPdfData => ({
  text,
  numpages,
  info: {},
  metadata: null,
});

const opts = (format: DigestOptions['format'], profile: DigestOptions['profile'] = 'generic'): DigestOptions => ({
  format,
  profile,
});

// ─── TextFormatter ────────────────────────────────────────────────────────────

describe('TextFormatter', () => {
  const f = new TextFormatter();

  it('collapses multiple spaces', () => {
    const result = f.format(makeData('hello   world'), opts('text'));
    expect(result).toBe('hello world');
  });

  it('strips non-printable characters', () => {
    const result = f.format(makeData('hello\x00world'), opts('text'));
    expect(result).toBe('hello world');
  });

  it('reduces multiple blank lines to one', () => {
    const result = f.format(makeData('a\n\n\n\nb'), opts('text'));
    expect(result).toBe('a\nb');
  });

  it('trims each line', () => {
    const result = f.format(makeData('  hello  \n  world  '), opts('text'));
    expect(result).toBe('hello\nworld');
  });
});

// ─── MarkdownFormatter ────────────────────────────────────────────────────────

describe('MarkdownFormatter', () => {
  const f = new MarkdownFormatter();

  it('converts ALL CAPS lines to h2 headings', () => {
    const result = f.format(makeData('EXPERIENCE\nWorked at Acme'), opts('md'));
    expect(result).toContain('## Experience');
    expect(result).toContain('Worked at Acme');
  });

  it('leaves mixed-case lines as paragraphs', () => {
    const result = f.format(makeData('Hello World'), opts('md'));
    expect(result).not.toContain('##');
    expect(result).toContain('Hello World');
  });

  it('does not produce triple blank lines', () => {
    const result = f.format(makeData('SECTION ONE\ntext\nSECTION TWO\nmore text'), opts('md'));
    expect(result).not.toMatch(/\n{3,}/);
  });
});

// ─── JsonFormatter ────────────────────────────────────────────────────────────

describe('JsonFormatter', () => {
  const f = new JsonFormatter();

  it('returns valid JSON', () => {
    const result = f.format(makeData('some text', 2), opts('json', 'generic'));
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('includes pages count', () => {
    const result = JSON.parse(f.format(makeData('text', 3), opts('json', 'generic')));
    expect(result.pages).toBe(3);
  });

  it('detects cv section headings', () => {
    const text = 'John Doe\nexperience\nWorked at Acme\neducation\nHarvard University';
    const result = JSON.parse(f.format(makeData(text), opts('json', 'cv')));
    const titles = result.sections.map((s: { title: string }) => s.title.toLowerCase());
    expect(titles).toContain('experience');
    expect(titles).toContain('education');
  });

  it('includes profile in output', () => {
    const result = JSON.parse(f.format(makeData('text'), opts('json', 'cv')));
    expect(result.profile).toBe('cv');
  });
});

// ─── LogFormatter ─────────────────────────────────────────────────────────────

describe('LogFormatter', () => {
  const f = new LogFormatter();

  it('returns valid single-line JSON', () => {
    const result = f.format(makeData('hello world', 1), opts('log'));
    expect(() => JSON.parse(result)).not.toThrow();
    expect(result).not.toContain('\n');
  });

  it('includes expected fields', () => {
    const result = JSON.parse(f.format(makeData('hello world', 2), opts('log')));
    expect(result).toHaveProperty('level', 'INFO');
    expect(result).toHaveProperty('source', 'pdf-digestor');
    expect(result).toHaveProperty('pages', 2);
    expect(result).toHaveProperty('charCount');
    expect(result).toHaveProperty('wordCount');
    expect(result).toHaveProperty('preview');
    expect(result).toHaveProperty('timestamp');
  });

  it('truncates preview to 200 chars', () => {
    const longText = 'a'.repeat(500);
    const result = JSON.parse(f.format(makeData(longText), opts('log')));
    expect(result.preview.length).toBeLessThanOrEqual(200);
  });
});
