import type { DigestOptions, ParsedPdfData } from '../types.js';

export abstract class PdfFormatter {
  abstract format(data: ParsedPdfData, options: DigestOptions): string;
}
