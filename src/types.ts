export type OutputFormat = 'json' | 'md' | 'text' | 'log';

export type Profile = 'cv' | 'invoice' | 'generic';

export interface DigestOptions {
  format: OutputFormat;
  profile: Profile;
}

export interface ParsedPdfData {
  text: string;
  numpages: number;
  info: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
}

export interface JsonSection {
  title: string;
  content: string[];
}

export interface JsonDigestResult {
  profile: Profile;
  pages: number;
  sections: JsonSection[];
  raw: string;
}

export interface LogEntry {
  level: 'INFO';
  source: string;
  pages: number;
  charCount: number;
  wordCount: number;
  preview: string;
  format: OutputFormat;
  timestamp: string;
}
