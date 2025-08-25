import type { Card, ReviewLog, Rating } from 'ts-fsrs';

enum VocabularySource {
  TOCFL = 'tocfl',
  USER = 'user'
}

export interface VocabularyItem {
  id: number;
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
  vocabularyId: number;
  fsrsCard: Card;
  reviewHistory: ReviewLog[];
  lastReviewed?: Date;
  nextReview: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlashcardWithVocabulary extends FlashcardData {
  vocabulary: VocabularyItem;
}

export interface VocabularyWithFlashcards extends VocabularyItem {
  flashcards: FlashcardData[];
}

// Appl state management
export interface FlashcardState {
  currentCard: FlashcardWithVocabulary | null;
  deck: FlashcardWithVocabulary[];
  reviewedToday: number;
  totalCards: number;
}

export type UserRating = Omit<Rating, "Manual">;
export const DEFAULT_DAILY_GOAL = 20;

