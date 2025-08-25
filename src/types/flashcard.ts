import type { Card, ReviewLog, Rating } from 'ts-fsrs';

export enum VocabularySource {
  TOCFL = 'tocfl',
  USER = 'user'
}

export interface VocabularyItem {
  id: string;
  vocabulary: string;
  pinyin: string;
  level?: string;
  source: VocabularySource;
  definition?: string;
  examples?: string;
  createdAt: Date;
}

export interface FlashcardData {
  id: string;
  vocabularyId: string;
  fsrsCard: Card;
  reviewHistory: ReviewLog[];
  lastReviewed?: Date;
  nextReview: Date;
  createdAt: Date;
  updatedAt: Date;
}


// Appl state management
export interface FlashcardState {
  currentCard: VocabularyItem | null;
  deck: FlashcardData[];
  reviewedToday: number;
  totalCards: number;
}

export type UserRating = Omit<Rating, "Manual">;
export const DEFAULT_DAILY_GOAL = 20;
