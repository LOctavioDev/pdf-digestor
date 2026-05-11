import { PdfFormatter } from './base.js';
import type { DigestOptions, JsonDigestResult, JsonSection, ParsedPdfData, Profile } from '../types.js';

const SECTION_KEYWORDS: Record<Profile, string[]> = {
  cv: [
    'experience', 'education', 'skills', 'summary', 'objective',
    'certifications', 'projects', 'languages', 'awards', 'publications',
    'experiencia', 'educación', 'habilidades', 'resumen', 'certificaciones',
  ],
  invoice: [
    'bill to', 'ship to', 'items', 'total', 'subtotal', 'tax',
    'payment', 'due date', 'invoice', 'description', 'quantity',
  ],
  generic: [],
};

const ALL_CAPS_LINE = /^[A-Z][A-Z\s]{4,}$/;

export class JsonFormatter extends PdfFormatter {
  format(data: ParsedPdfData, options: DigestOptions): string {
    const keywords = SECTION_KEYWORDS[options.profile] ?? [];
    const lines = data.text
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const sections: JsonSection[] = [];
    let current: JsonSection = { title: 'Header', content: [] };

    for (const line of lines) {
      const lower = line.toLowerCase();
      const isKeywordHeading = keywords.some((kw) => lower === kw || lower.startsWith(kw + ' '));
      const isAllCaps = ALL_CAPS_LINE.test(line);

      if (isKeywordHeading || (isAllCaps && options.profile !== 'generic')) {
        if (current.content.length > 0) sections.push(current);
        current = { title: this.toTitleCase(line), content: [] };
      } else {
        current.content.push(line);
      }
    }
    if (current.content.length > 0) sections.push(current);

    const result: JsonDigestResult = {
      profile: options.profile,
      pages: data.numpages,
      sections,
      raw: lines.join(' ').replace(/\s{2,}/g, ' '),
    };

    return JSON.stringify(result, null, 2);
  }

  private toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
