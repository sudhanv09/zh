import fs from 'fs/promises';
import path from 'path';
import type { CCDict } from '~/types/dictionary';

export interface DictionarySearchResult {
  entries: CCDict[];
  totalCount: number;
  searchTime: number;
  query: string;
}

export class DictionaryService {
  private entries: CCDict[] = [];
  private readonly dictionaryPath: string;
  private readonly maxResults: number;

  constructor(dictionaryPath: string = 'assets/cedict_ts.u8', maxResults: number = 100) {
    this.dictionaryPath = path.resolve(process.cwd(), dictionaryPath);
    this.maxResults = maxResults;
  }

  async loadDictionary(): Promise<void> {
    const dictFile = await fs.readFile(this.dictionaryPath, 'utf-8');
    this.entries = this.parseDict(dictFile.split('\n'));
  }

  parseDict(lines: string[]): CCDict[] {
    const dict: CCDict[] = [];
    const lineRegex = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.+)\/$/;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('#') || trimmedLine === '') {
        continue;
      }

      const match = trimmedLine.match(lineRegex);

      if (!match) {
        continue;
      }

      const [, traditional, simplified, pinyin, definitions] = match;

      const defs = definitions
        .split('/')
        .filter(def => def.trim() !== '')
        .map(def => def.trim());

      dict.push({
        traditional,
        simplified,
        pinyin,
        definition: defs,
      });
    }

    return dict;
  }

  async searchDictionary(query: string): Promise<DictionarySearchResult> {
    const start = Date.now();
    if (this.entries.length === 0) throw new Error('Dictionary not loaded');
    if (!query || !query.trim()) return { entries: [], totalCount: 0, searchTime: 0, query: '' };

    let results: CCDict[] = [];

    if (/[\u4e00-\u9fff]/.test(query)) {
      results = this.entries.filter(
        e => e.simplified.includes(query) || e.traditional.includes(query)
      );
    } else {
      const q = query.toLowerCase();
      results = this.entries.filter(
        e => e.simplified.toLowerCase().includes(q) ||
          e.traditional.toLowerCase().includes(q) ||
          e.definition.some(def => def.toLowerCase().includes(q))
      );
    }

    const unique = this.removeDuplicates(results).slice(0, this.maxResults);
    return {
      entries: unique,
      totalCount: unique.length,
      searchTime: Date.now() - start,
      query
    };
  }

  private removeDuplicates(entries: CCDict[]): CCDict[] {
    const seen = new Set<string>();
    return entries.filter(e => {
      const key = `${e.simplified}|${e.traditional}|${e.pinyin}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  isLoaded(): boolean {
    return this.entries.length > 0;
  }
}

export const dictionaryService = new DictionaryService();
