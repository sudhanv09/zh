import { parseDict } from '~/service/dict-parser'
import { expect, test, describe } from 'vitest';

describe('Dictionary Parser', () => {
  describe('Basic parsing functionality', () => {
    test('should parse basic dictionary entry with single definition', () => {
      const result = parseDict(['3P 3P [san1 P] /(slang) threesome/']);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        traditional: '3P',
        simplified: '3P',
        pinyin: 'san1 P',
        definition: ['(slang) threesome'],
      });
    });

    test('should parse entry with multiple definitions', () => {
      const result = parseDict(['䈰 筲 [shao1] /pot-scrubbing brush made of bamboo strips/basket (container) for chopsticks/variant of 筲[shao1]/']);
      
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
      const result = parseDict(['聽不到 听不到 [ting1 bu5 dao4] /can\'t hear/']);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        traditional: '聽不到',
        simplified: '听不到',
        pinyin: 'ting1 bu5 dao4',
        definition: ['can\'t hear'],
      });
    });

    test('should parse entry with complex pinyin containing spaces', () => {
      const result = parseDict(['你好 你好 [ni3 hao3] /hello/hi/']);
      
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
    test('should handle empty definitions', () => {
      const result = parseDict(['测试 测试 [ce4 shi4] //']);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        traditional: '测试',
        simplified: '测试',
        pinyin: 'ce4 shi4',
        definition: [],
      });
    });

    test('should handle entries with no definitions', () => {
      const result = parseDict(['㟃 㟃 [si1] /(used in place names)/']);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        traditional: '㟃',
        simplified: '㟃',
        pinyin: 'si1',
        definition: ['(used in place names)'],
      });
    });

    test('should handle entries with special characters in definitions', () => {
      const result = parseDict(['测试 测试 [ce4 shi4] /test with [brackets] and (parentheses)/another/test/']);
      
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
      const result = parseDict(['我 我 [wo3] /I/me/']);
      
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
      const result = parseDict([
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
      const result = parseDict([
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
      const result = parseDict([
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

      const result = parseDict(testLines);
      
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

      const result = parseDict(mixedLines);
      
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

      const result = parseDict(realEntries);
      
      expect(result).toHaveLength(5);
      expect(result[0].traditional).toBe('的');
      expect(result[0].definition).toContain('of');
      expect(result[0].definition).toContain('~\'s (possessive particle)');
    });
  });
});