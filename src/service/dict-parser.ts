import fs from 'fs/promises'
import type { CCDict } from '~/types/dictionary'

export async function loadDictionary() {
    const dictFile = await fs.readFile("./assets/cedict_ts.u8", "utf-8");
    const lines = dictFile.split("\n");
    return lines
}

export function parseDict(lines: string[]): CCDict[] {
    const dict: CCDict[] = [];

    for (const line of lines) {
        // skip comments
        if (line.startsWith('#') || line.trim() === "") {
            continue;
        }

        const match = line.match(/^(\S+)\s+(\S+)\s+\[(.+?)\]\s+(.*)$/);
        if (!match) continue;

        const [, traditional, simplified, pinyin, rest] = match;

        const firstSlash = rest.indexOf('/');
        const lastSlash = rest.lastIndexOf('/');
        let defs: string[] = [];
        if (firstSlash !== -1 && lastSlash !== -1 && lastSlash > firstSlash) {
            const inner = rest.slice(firstSlash + 1, lastSlash);
            defs = inner.split('/').filter(Boolean).map(s => s.trim());
        }

        dict.push({ traditional: traditional, simplified: simplified, pinyin: pinyin, definition: defs })
    }

    return dict;
}


