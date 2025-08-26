import type { Card, ReviewLog, Rating } from 'ts-fsrs';

export interface VocabularyItem {
  vocabulary: string;
  pinyin: string;
  level: string;
}

export interface FlashcardData extends VocabularyItem {
  id: string;
  fsrsCard: Card;
  reviewHistory: ReviewLog[];
  lastReviewed?: Date;
  nextReview: Date;
}

// Appl state management
export interface FlashcardState {
  currentCard: FlashcardData | null;
  deck: FlashcardData[];
  reviewedToday: number;
  totalCards: number;
}

export type UserRating = Omit<Rating, "Manual">;
export const DEFAULT_DAILY_GOAL = 20;
