import { fsrs, type RecordLog, Rating } from 'ts-fsrs';
import type { FlashcardData } from '~/types/flashcard';

const fsrsEngine = fsrs();


export function processReview(card: FlashcardData, rating: Rating): FlashcardData {
  const now = new Date();
  
  const schedulingCards: RecordLog = fsrsEngine.repeat(card.fsrsCard, now);
  const ratingResult = schedulingCards[rating];
  
  if (!ratingResult) {
    throw new Error(`Invalid rating: ${rating}`);
  }
  
  const updatedCard = ratingResult.card;
  const reviewLog = ratingResult.log;
  
  return {
    ...card,
    fsrsCard: updatedCard,
    reviewHistory: [...card.reviewHistory, reviewLog],
    lastReviewed: now,
    nextReview: updatedCard.due,
  };
}


export function isCardDue(card: FlashcardData, currentTime: Date = new Date()): boolean {
  return card.nextReview <= currentTime;
}


export function getDueCards(cards: FlashcardData[], currentTime: Date = new Date()): FlashcardData[] {
  return cards.filter(card => isCardDue(card, currentTime));
}

/**
 * Sorts cards by priority for review selection
 * Priority order:
 * 1. Overdue cards (sorted by how overdue they are, most overdue first)
 * 2. Cards due now
 * 3. New cards (never reviewed)
 */
export function sortCardsByPriority(cards: FlashcardData[], currentTime: Date = new Date()): FlashcardData[] {
  return [...cards].sort((a, b) => {
    const aOverdue = currentTime.getTime() - a.nextReview.getTime();
    const bOverdue = currentTime.getTime() - b.nextReview.getTime();
    
    // Both cards are overdue - prioritize more overdue cards
    if (aOverdue > 0 && bOverdue > 0) {
      return bOverdue - aOverdue; // More overdue first
    }
    
    // One card is overdue, one is not - overdue card has priority
    if (aOverdue > 0 && bOverdue <= 0) {
      return -1; // a comes first
    }
    if (bOverdue > 0 && aOverdue <= 0) {
      return 1; // b comes first
    }
    
    // Neither card is overdue - sort by next review time (earlier first)
    return a.nextReview.getTime() - b.nextReview.getTime();
  });
}


export function selectNextCard(cards: FlashcardData[], currentTime: Date = new Date()): FlashcardData | null {
  const dueCards = getDueCards(cards, currentTime);
  
  if (dueCards.length === 0) {
    return null;
  }
  
  const sortedCards = sortCardsByPriority(dueCards, currentTime);
  return sortedCards[0];
}


export function getDeckStats(cards: FlashcardData[], currentTime: Date = new Date()) {
  const dueCards = getDueCards(cards, currentTime);
  const newCards = cards.filter(card => card.reviewHistory.length === 0);
  const reviewedCards = cards.filter(card => card.reviewHistory.length > 0);
  
  return {
    totalCards: cards.length,
    dueCards: dueCards.length,
    newCards: newCards.length,
    reviewedCards: reviewedCards.length,
    overdueCards: dueCards.filter(card => card.nextReview < currentTime).length,
  };
}


export function previewNextInterval(card: FlashcardData, rating: Rating): { interval: number; nextReview: Date } {
  const now = new Date();
  const schedulingCards = fsrsEngine.repeat(card.fsrsCard, now);
  
  const ratingResult = schedulingCards[rating];
  
  if (!ratingResult) {
    throw new Error(`Invalid rating: ${rating}`);
  }
  
  const scheduledCard = ratingResult.card;
  const intervalMs = scheduledCard.due.getTime() - now.getTime();
  const intervalDays = Math.ceil(intervalMs / (1000 * 60 * 60 * 24));
  
  return {
    interval: intervalDays,
    nextReview: scheduledCard.due,
  };
}