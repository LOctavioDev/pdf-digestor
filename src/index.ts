import { readFile } from 'fs/promises';
import type { OutputFormat, ParsedPdfData, Profile } from './types.js';

type PdfParseResult = {
  text: string;
  numpages: number;
  info: Record<string, unknown>;
  metadata: unknown;
};
// pdf-parse is a CJS-only module; require() keeps DTS clean across CJS+ESM builds
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<PdfParseResult>;
import {
  JsonFormatter,
  LogFormatter,
  MarkdownFormatter,
  PdfFormatter,
  TextFormatter,
} from './formatters/index.js';

export type { OutputFormat, Profile, JsonDigestResult, JsonSection, LogEntry, DigestOptions } from './types.js';
export { PdfFormatter, JsonFormatter, MarkdownFormatter, TextFormatter, LogFormatter } from './formatters/index.js';

const FORMATTERS: Record<OutputFormat, () => PdfFormatter> = {
  json: () => new JsonFormatter(),
  md: () => new MarkdownFormatter(),
  text: () => new TextFormatter(),
  log: () => new LogFormatter(),
};

class DigestBuilder {
  private _buffer: Buffer | null = null;
  private _format: OutputFormat = 'text';
  private _profile: Profile = 'generic';

  constructor(buffer: Buffer) {
    this._buffer = buffer;
  }

  useProfile(profile: Profile): this {
    this._profile = profile;
    return this;
  }

  toFormat(format: OutputFormat): this {
    this._format = format;
    return this;
  }

  async digest(): Promise<string> {
    if (!this._buffer) throw new Error('No PDF source provided.');

    const raw = await pdfParse(this._buffer);
    const data: ParsedPdfData = {
      text: raw.text,
      numpages: raw.numpages,
      info: raw.info as Record<string, unknown>,
      metadata: raw.metadata as Record<string, unknown> | null,
    };

    const formatter = FORMATTERS[this._format]();
    return formatter.format(data, { format: this._format, profile: this._profile });
  }
}

export class PdfDigestor {
  fromBuffer(buffer: Buffer): DigestBuilder {
    return new DigestBuilder(buffer);
  }

  async fromPath(filePath: string): Promise<DigestBuilder> {
    const buffer = await readFile(filePath);
    return new DigestBuilder(buffer);
  }
}
