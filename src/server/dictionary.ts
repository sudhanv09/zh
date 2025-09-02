import { createServerFn } from '@tanstack/solid-start';
import { dictionaryService } from '~/service/dictionary-service';
import type {
    DictionarySearchResult,
    DictionaryApiResponse,
} from '~/types/dictionary';


function validateSearchQuery(query: string): string {
    if (typeof query !== 'string') {
        throw new Error('Query must be a string');
    }

    // Sanitize input - remove potentially harmful characters
    const sanitized = query
        .trim()
        .replace(/[<>\"'&]/g, '') // Remove HTML/script
        .substring(0, 100);

    return sanitized;
}

export const searchDictionary = createServerFn({
    method: 'POST'
}).validator((data: string) => data)
.handler(async (ctx): Promise<DictionaryApiResponse<DictionarySearchResult>> => {
    try {
        const data = ctx.data;

        const query = validateSearchQuery(data);
        if (!query || query.length === 0) {
            return {
                success: true,
                data: {
                    entries: [],
                    totalCount: 0,
                    searchTime: 0,
                    query: query
                }
            };
        }

        if (!dictionaryService.isLoaded()) {
            console.log('Dictionary not loaded, loading now...');
            await dictionaryService.loadDictionary();
        }

        const searchResult = await dictionaryService.searchDictionary(query);

        return {
            success: true,
            data: searchResult
        };

    } catch (error) {
        console.error('Dictionary search error:', error);

        if (error instanceof Error && 'code' in error) {
            return {
                success: false,
                error: {
                    code: (error as any).code,
                    message: error.message
                }
            };
        }

        return {
            success: false,
            error: {
                code: 'SEARCH_ERROR',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            }
        };
    }
});

export async function initializeDictionary(): Promise<void> {
    "use server";
    try {
        if (!dictionaryService.isLoaded()) {
            await dictionaryService.loadDictionary();
        }
    } catch (error) {
        console.error('Failed to initialize dictionary:', error);
    }
}