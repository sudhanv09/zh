import { nanoid } from 'nanoid';
import { createEmptyCard } from 'ts-fsrs';
import { eq } from 'drizzle-orm';

import { db } from "~/db";
import { flashcards } from "~/db/schema";
import { type VocabularyItem, type FlashcardData, DEFAULT_DAILY_GOAL } from "~/types/flashcard";


export function transformToFlashcard(item: VocabularyItem): FlashcardData {
    const id = nanoid(6);
    const fsrsCard = createEmptyCard();
    const now = new Date();

    return {
        id,
        vocabulary: item.vocabulary,
        pinyin: item.pinyin,
        level: item.level,
        fsrsCard,
        reviewHistory: [],
        lastReviewed: undefined,
        nextReview: now, // New cards are available immediately
    };
}

export async function getAllFlashcards(): Promise<FlashcardData[]> {
  const result = await db.select().from(flashcards);
  return result.map(card => ({
    id: card.id,
    vocabulary: card.vocabulary,
    pinyin: card.pinyin,
    level: card.level,
    fsrsCard: typeof card.fsrsCard === 'string' ? JSON.parse(card.fsrsCard) : card.fsrsCard,
    reviewHistory: card.reviewHistory ? (typeof card.reviewHistory === 'string' ? JSON.parse(card.reviewHistory) : card.reviewHistory) : [],
    lastReviewed: card.lastReviewed ? new Date(card.lastReviewed * 1000) : undefined,
    nextReview: new Date(card.nextReview * 1000)
  }));
}

/**
 * Server function for loading vocabulary data as flashcards
 * Transforms vocabulary items into flashcard format with FSRS data
 */
export async function cardsToReview(): Promise<FlashcardData[]> {
    "use server";
    try {
        const flashcardData = await getAllFlashcards();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cardsToReview = flashcardData.filter((card: FlashcardData) => {
            const nextReview = new Date(card.nextReview);
            nextReview.setHours(0,0,0,0);
            return nextReview <= today;
        })

        return cardsToReview.slice(0, DEFAULT_DAILY_GOAL);
    } catch (error) {
        console.error("Error transforming vocabulary to flashcard data:", error);
        return [];
    }
}

/**
 * Server function for updating a flashcard in the database
 * @param updatedCard The updated flashcard data
 */
export async function updateFlashcard(updatedCard: FlashcardData): Promise<void> {
    "use server";

    try {
        await db.update(flashcards)
            .set({
                fsrsCard: JSON.stringify(updatedCard.fsrsCard),
                reviewHistory: JSON.stringify(updatedCard.reviewHistory),
                lastReviewed: updatedCard.lastReviewed ? Math.floor(updatedCard.lastReviewed.getTime() / 1000) : null,
                nextReview: Math.floor(updatedCard.nextReview.getTime() / 1000),
                updatedAt: Math.floor(Date.now() / 1000)
            })
            .where(eq(flashcards.id, updatedCard.id));
    } catch (error) {
        console.error("Error updating flashcard:", error);
        throw new Error("Failed to update flashcard");
    }
}

/**
 * Client-side utility for getting vocabulary statistics
 */
export function getVocabularyStats(vocabulary: VocabularyItem[]) {
    const totalWords = vocabulary.length;
    const levelCounts: Record<string, number> = {};

    vocabulary.forEach(item => {
        levelCounts[item.level] = (levelCounts[item.level] || 0) + 1;
    });

    return {
        totalWords,
        levelCounts,
        uniqueLevels: Object.keys(levelCounts).sort()
    };
}