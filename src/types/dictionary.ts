
export type CCDict = {
    simplified: string
    traditional: string
    pinyin: string
    definition: string[]
}

export interface DictionarySearchRequest {
    query: string;
}

export interface DictionarySearchResult {
    entries: CCDict[];
    totalCount: number;
    searchTime: number;
    query: string;
}

export interface DictionaryApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}