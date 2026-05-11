import { PdfFormatter } from './base.js';
import type { DigestOptions, ParsedPdfData } from '../types.js';

export class TextFormatter extends PdfFormatter {
  format(data: ParsedPdfData, _options: DigestOptions): string {
    return data.text
      .replace(/[^\x20-\x7E\n]/g, ' ')   // strip non-printable except newline
      .replace(/[ \t]+/g, ' ')            // collapse horizontal whitespace
      .replace(/\n{3,}/g, '\n\n')         // max two consecutive newlines
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join('\n')
      .trim();
  }
}
