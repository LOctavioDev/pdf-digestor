import { PdfFormatter } from './base.js';
import type { DigestOptions, LogEntry, ParsedPdfData } from '../types.js';

export class LogFormatter extends PdfFormatter {
  format(data: ParsedPdfData, options: DigestOptions): string {
    const clean = data.text.replace(/\s+/g, ' ').trim();
    const words = clean.split(' ').filter(Boolean);

    const entry: LogEntry = {
      level: 'INFO',
      source: 'pdf-digestor',
      pages: data.numpages,
      charCount: clean.length,
      wordCount: words.length,
      preview: clean.slice(0, 200),
      format: options.format,
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(entry);
  }
}
