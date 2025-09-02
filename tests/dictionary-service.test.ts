import * as path from 'path';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import fs from 'fs/promises';
import { DictionaryService } from '~/service/dictionary-service';

// Mock fs module
vi.mock('fs/promises');
const mockFs = vi.mocked(fs);

describe('DictionaryService', () => {
  let service: DictionaryService;
  const mockDictionaryContent = `# CC-CEDICT
# Community maintained free Chinese-English dictionary.
#
# Published by MDBG
# License: https://creativecommons.org/licenses/by-sa/4.0/
#
# Version: 2024-01-01T00:00:00Z
# More info: https://cc-cedict.org/wiki/
#
你好 你好 [ni3 hao3] /hello/hi/
测试 测试 [ce4 shi4] /test/testing/
聽不到 听不到 [ting1 bu5 dao4] /can't hear/
3P 3P [san1 P] /(slang) threesome/
我 我 [wo3] /I/me/
是 是 [shi4] /is/are/am/yes/to be/
的 的 [de5] /of/~'s (possessive particle)/used after an attribute/
不 不 [bu4] /(negative prefix)/not/no/
在 在 [zai4] /(located) at/in/exist/
了 了 [le5] /(modal particle intensifying preceding clause)/(completed action marker)/`;

  beforeEach(() => {
    service = new DictionaryService('./test-dict.txt', 50);
    vi.clearAllMocks();
  });

  describe('Constructor and initialization', () => {
    test('should create service with default parameters', () => {
      const defaultService = new DictionaryService();
      expect(defaultService.isLoaded()).toBe(false);
    });

    test('should create service with custom parameters', () => {
      const customService = new DictionaryService('./custom-dict.txt', 25);
      expect(customService.isLoaded()).toBe(false);
    });
  });

  describe('loadDictionary', () => {
    test('should load dictionary successfully', async () => {
      mockFs.readFile.mockResolvedValue(mockDictionaryContent);

      await service.loadDictionary();

      expect(service.isLoaded()).toBe(true);
      const expectedPath = path.resolve(process.cwd(), './test-dict.txt');
      expect(mockFs.readFile).toHaveBeenCalledWith(expectedPath, 'utf-8');
    });

    test('should throw error when file cannot be read', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(service.loadDictionary()).rejects.toThrow('File not found');

      expect(service.isLoaded()).toBe(false);
    });
  });

  describe('searchDictionary', () => {
    beforeEach(async () => {
      mockFs.readFile.mockResolvedValue(mockDictionaryContent);
      await service.loadDictionary();
    });

    describe('Input validation', () => {
      test('should return empty results for empty query', async () => {
        const result = await service.searchDictionary('');

        expect(result.entries).toHaveLength(0);
        expect(result.totalCount).toBe(0);
        expect(result.query).toBe('');
      });

      test('should return empty results for whitespace-only query', async () => {
        const result = await service.searchDictionary('   ');

        expect(result.entries).toHaveLength(0);
        expect(result.totalCount).toBe(0);
        expect(result.query).toBe('');
      });

      test('should handle null/undefined query', async () => {
        const result = await service.searchDictionary(null as any);

        expect(result.entries).toHaveLength(0);
        expect(result.totalCount).toBe(0);
      });

      test('should throw error when dictionary not loaded', async () => {
        const unloadedService = new DictionaryService();

        await expect(unloadedService.searchDictionary('test')).rejects.toThrow('Dictionary not loaded');
      });
    });

    describe('Chinese character search', () => {
      test('should find exact Chinese character matches', async () => {
        const result = await service.searchDictionary('你好');

        expect(result.entries).toHaveLength(1);
        expect(result.entries[0].simplified).toBe('你好');
        expect(result.entries[0].definition).toContain('hello');
        expect(result.totalCount).toBe(1);
      });

      test('should find partial Chinese character matches', async () => {
        const result = await service.searchDictionary('你');

        expect(result.entries.length).toBeGreaterThan(0);
        expect(result.entries.some(entry => entry.simplified.includes('你'))).toBe(true);
      });

      test('should find traditional Chinese characters', async () => {
        const result = await service.searchDictionary('聽不到');

        expect(result.entries).toHaveLength(1);
        expect(result.entries[0].traditional).toBe('聽不到');
        expect(result.entries[0].simplified).toBe('听不到');
      });

      test('should find single Chinese characters', async () => {
        const result = await service.searchDictionary('我');

        expect(result.entries).toHaveLength(1);
        expect(result.entries[0].simplified).toBe('我');
        expect(result.entries[0].definition).toContain('I');
      });
    });

    describe('English search', () => {
      test('should find entries by English definition', async () => {
        const result = await service.searchDictionary('hello');

        expect(result.entries.length).toBeGreaterThan(0);
        expect(result.entries.some(entry =>
          entry.definition.some(def => def.toLowerCase().includes('hello'))
        )).toBe(true);
      });

      test('should find entries with partial English matches', async () => {
        const result = await service.searchDictionary('test');

        expect(result.entries.length).toBeGreaterThan(0);
        expect(result.entries.some(entry =>
          entry.definition.some(def => def.toLowerCase().includes('test'))
        )).toBe(true);
      });

      test('should be case insensitive for English search', async () => {
        const lowerResult = await service.searchDictionary('hello');
        const upperResult = await service.searchDictionary('HELLO');
        const mixedResult = await service.searchDictionary('Hello');

        expect(lowerResult.entries.length).toBe(upperResult.entries.length);
        expect(lowerResult.entries.length).toBe(mixedResult.entries.length);
      });

      test('should handle multi-word English queries', async () => {
        const result = await service.searchDictionary('possessive particle');

        expect(result.entries.length).toBeGreaterThan(0);
        expect(result.entries.some(entry =>
          entry.definition.some(def => def.includes('possessive particle'))
        )).toBe(true);
      });
    });


    describe('Mixed search types', () => {
      test('should handle alphanumeric queries like "3P"', async () => {
        const result = await service.searchDictionary('3P');

        expect(result.entries).toHaveLength(1);
        expect(result.entries[0].simplified).toBe('3P');
      });
    });

    describe('Result formatting and limits', () => {
      test('should include search metadata', async () => {
        const result = await service.searchDictionary('test');

        expect(result).toHaveProperty('entries');
        expect(result).toHaveProperty('totalCount');
        expect(result).toHaveProperty('searchTime');
        expect(result).toHaveProperty('query');
        expect(result.query).toBe('test');
        expect(typeof result.searchTime).toBe('number');
        expect(result.searchTime).toBeGreaterThanOrEqual(0);
      });

      test('should remove duplicate entries', async () => {
        const result = await service.searchDictionary('hello');

        const uniqueEntries = new Set(result.entries.map(entry =>
          `${entry.simplified}|${entry.traditional}|${entry.pinyin}`
        ));

        expect(uniqueEntries.size).toBe(result.entries.length);
      });

      test('should respect maximum results limit', async () => {
        const limitedService = new DictionaryService('./test-dict.txt', 2);
        mockFs.readFile.mockResolvedValue(mockDictionaryContent);
        await limitedService.loadDictionary();

        const result = await limitedService.searchDictionary('e'); // Should match many entries

        expect(result.entries.length).toBeLessThanOrEqual(2);
        expect(result.totalCount).toBeGreaterThanOrEqual(result.entries.length);
      });
    });

    describe('Error handling', () => {
      test('should handle search errors gracefully', async () => {
        // Mock a search that throws an error
        const errorService = new DictionaryService();
        mockFs.readFile.mockResolvedValue(mockDictionaryContent);
        await errorService.loadDictionary();

        // Force an error by corrupting the entries
        (errorService as any).entries = null;

        await expect(errorService.searchDictionary('test')).rejects.toThrow();
      });
    });
  });

  describe('Utility methods', () => {
    test('should report correct loading status', () => {
      expect(service.isLoaded()).toBe(false);
    });
  });


  describe('Edge cases', () => {
    test('should handle special characters in search', async () => {
      mockFs.readFile.mockResolvedValue(mockDictionaryContent);
      await service.loadDictionary();

      const result = await service.searchDictionary("can't");

      expect(result.entries.length).toBeGreaterThanOrEqual(0);
      // Should not throw error
    });

    test('should handle very long search queries', async () => {
      mockFs.readFile.mockResolvedValue(mockDictionaryContent);
      await service.loadDictionary();

      const longQuery = 'a'.repeat(1000);
      const result = await service.searchDictionary(longQuery);

      expect(result.entries).toHaveLength(0);
      expect(result.query).toBe(longQuery);
    });

    test('should handle Unicode characters properly', async () => {
      mockFs.readFile.mockResolvedValue(mockDictionaryContent);
      await service.loadDictionary();

      const result = await service.searchDictionary('你好');

      expect(result.entries.length).toBeGreaterThan(0);
      expect(result.entries[0].simplified).toBe('你好');
    });
  });

  describe('parseDict', () => {
    describe('Basic parsing functionality', () => {
      test('should parse basic dictionary entry with single definition', () => {
        const result = service.parseDict(['3P 3P [san1 P] /(slang) threesome/']);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          traditional: '3P',
          simplified: '3P',
          pinyin: 'san1 P',
          definition: ['(slang) threesome'],
        });
      });

      test('should parse entry with multiple definitions', () => {
        const result = service.parseDict(['䈰 筲 [shao1] /pot-scrubbing brush made of bamboo strips/basket (container) for chopsticks/variant of 筲[shao1]/']);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          traditional: '䈰',
          simplified: '筲',
          pinyin: 'shao1',
          definition: [
            'pot-scrubbing brush made of bamboo strips',
            'basket (container) for chopsticks',
            'variant of 筲[shao1]'
          ],
        });
      });

      test('should parse entry with different traditional and simplified forms', () => {
        const result = service.parseDict(['聽不到 听不到 [ting1 bu5 dao4] /can\'t hear/']);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          traditional: '聽不到',
          simplified: '听不到',
          pinyin: 'ting1 bu5 dao4',
          definition: ['can\'t hear'],
        });
      });

      test('should parse entry with complex pinyin containing spaces', () => {
        const result = service.parseDict(['你好 你好 [ni3 hao3] /hello/hi/']);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          traditional: '你好',
          simplified: '你好',
          pinyin: 'ni3 hao3',
          definition: ['hello', 'hi'],
        });
      });
    });

    describe('Edge cases and special handling', () => {
      test('should handle entries with no definitions', () => {
        const result = service.parseDict(['㟃 㟃 [si1] /(used in place names)/']);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          traditional: '㟃',
          simplified: '㟃',
          pinyin: 'si1',
          definition: ['(used in place names)'],
        });
      });

      test('should handle entries with special characters in definitions', () => {
        const result = service.parseDict(['测试 测试 [ce4 shi4] /test with [brackets] and (parentheses)/another/test/']);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          traditional: '测试',
          simplified: '测试',
          pinyin: 'ce4 shi4',
          definition: [
            'test with [brackets] and (parentheses)',
            'another',
            'test'
          ],
        });
      });

      test('should handle single character entries', () => {
        const result = service.parseDict(['我 我 [wo3] /I/me/']);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          traditional: '我',
          simplified: '我',
          pinyin: 'wo3',
          definition: ['I', 'me'],
        });
      });
    });

    describe('Filtering and skipping', () => {
      test('should skip comment lines starting with #', () => {
        const result = service.parseDict([
          '# This is a comment',
          '测试 测试 [ce4 shi4] /test/',
          '# Another comment'
        ]);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
          traditional: '测试',
          simplified: '测试',
          pinyin: 'ce4 shi4',
          definition: ['test'],
        });
      });

      test('should skip empty lines', () => {
        const result = service.parseDict([
          '',
          '测试 测试 [ce4 shi4] /test/',
          '',
          '你好 你好 [ni3 hao3] /hello/',
          ''
        ]);

        expect(result).toHaveLength(2);
        expect(result[0].traditional).toBe('测试');
        expect(result[1].traditional).toBe('你好');
      });

      test('should skip malformed lines', () => {
        const result = service.parseDict([
          'invalid line without proper format',
          '测试 测试 [ce4 shi4] /test/',
          'another invalid line',
          ''
        ]);

        expect(result).toHaveLength(1);
        expect(result[0].traditional).toBe('测试');
      });
    });

    describe('Batch processing', () => {
      test('should parse multiple entries correctly', () => {
        const testLines = [
          '3P 3P [san1 P] /(slang) threesome/',
          '㟃 㟃 [si1] /(used in place names)/',
          '㻽 㻽 [xuan2] /variant of 璿|璇[xuan2]/also pr. [sui4]/',
          '䈰 筲 [shao1] /pot-scrubbing brush made of bamboo strips/basket (container) for chopsticks/variant of 筲[shao1]/',
          '䴉嘴鷸 鹮嘴鹬 [huan2 zui3 yu4] /(bird species of China) ibisbill (Ibidorhyncha struthersii)/',
          '湘東 湘东 [Xiang1 dong1] /Xiangdong district of Pingxiang city 萍鄉市|萍乡市, Jiangxi/',
          '聽不到 听不到 [ting1 bu5 dao4] /can\'t hear/',
          '# This is a comment',
          '',
          '测试 测试 [ce4 shi4] /test/testing/'
        ];

        const result = service.parseDict(testLines);

        expect(result).toHaveLength(8);

        expect(result[0]).toEqual({
          traditional: '3P',
          simplified: '3P',
          pinyin: 'san1 P',
          definition: ['(slang) threesome'],
        });

        expect(result[1]).toEqual({
          traditional: '㟃',
          simplified: '㟃',
          pinyin: 'si1',
          definition: ['(used in place names)'],
        });

        expect(result[2]).toEqual({
          traditional: '㻽',
          simplified: '㻽',
          pinyin: 'xuan2',
          definition: [
            'variant of 璿|璇[xuan2]',
            'also pr. [sui4]'
          ],
        });
      });

      test('should handle large batch with mixed valid and invalid entries', () => {
        const mixedLines = [
          '# Header comment',
          '',
          '有效 有效 [you3 xiao4] /valid/effective/',
          'invalid line',
          '',
          '# Another comment',
          '測試 测试 [ce4 shi4] /test/',
          'malformed entry without brackets',
          '你好 你好 [ni3 hao3] /hello/hi/',
          ''
        ];

        const result = service.parseDict(mixedLines);

        expect(result).toHaveLength(3);
        expect(result.map(r => r.traditional)).toEqual(['有效', '測試', '你好']);
      });
    });

    describe('Real-world CEDICT format', () => {
      test('should handle actual CEDICT entries', () => {
        const realEntries = [
          '的 的 [de5] /of/~\'s (possessive particle)/used after an attribute/used to form a nominal expression/used in the construction 是...的 (emphasizing the word or phrase that follows)/',
          '是 是 [shi4] /is/are/am/yes/to be/',
          '了 了 [le5] /(modal particle intensifying preceding clause)/(completed action marker)/',
          '不 不 [bu4] /(negative prefix)/not/no/',
          '在 在 [zai4] /(located) at/in/exist/'
        ];

        const result = service.parseDict(realEntries);

        expect(result).toHaveLength(5);
        expect(result[0].traditional).toBe('的');
        expect(result[0].definition).toContain('of');
        expect(result[0].definition).toContain('~\'s (possessive particle)');
      });
    });
  });
});