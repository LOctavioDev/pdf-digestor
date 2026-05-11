import { PdfFormatter } from './base.js';
import type { DigestOptions, ParsedPdfData } from '../types.js';

const HEADING_PATTERN = /^[A-Z][A-Z\s]{4,}$/;

export class MarkdownFormatter extends PdfFormatter {
  format(data: ParsedPdfData, _options: DigestOptions): string {
    const lines = data.text
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const output: string[] = [];
    let prevWasHeading = false;

    for (const line of lines) {
      if (HEADING_PATTERN.test(line)) {
        if (output.length > 0 && !prevWasHeading) output.push('');
        output.push(`## ${this.toTitleCase(line)}`);
        output.push('');
        prevWasHeading = true;
      } else {
        output.push(line);
        prevWasHeading = false;
      }
    }

    return output.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  private toTitleCase(str: string): string {
    return str
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}
