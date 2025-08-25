import { State, type Card, type ReviewLog } from 'ts-fsrs';
import { nanoid } from 'nanoid'
import { flashcards, vocabulary, type VocabTable } from './schema';
import type { FlashcardData } from '~/types/flashcard';
import { db } from './index';
import { inArray, not } from 'drizzle-orm';

function mapToFlashcard(items: VocabTable[]): FlashcardData[] {
    return items.map(item => ({
        id: nanoid(6),
        vocabularyId: item.id,
        fsrsCard: {
            due: new Date(),
            stability: 0,
            difficulty: 0,
            elapsed_days: 0,
            scheduled_days: 0,
            repetitions: 0,
            lapses: 0,
            state: State.New,
            lastReview: new Date(),
            learning_steps: 0,
            reps: 0,
        } as Card,
        reviewHistory: [],
        nextReview: new Date(),
        createdAt: new Date((item.createdAt || Date.now()) * 1000),
        updatedAt: new Date(),
    }))
};

export async function getAllFlashcards(): Promise<FlashcardData[]> {
    try {
        const vocabItems = await db.select().from(vocabulary);
        return mapToFlashcard(vocabItems);
    } catch (error) {
        console.error("Error getting vocabulary from database:", error);
        return [];
    }
}

export async function getExistingFlashcards(): Promise<FlashcardData[]> {
    const rows = await db.select().from(flashcards);

    return rows.map((row) => ({
        ...row,
        fsrsCard: row.fsrsCard as Card,
        reviewHistory: row.reviewHistory as unknown as ReviewLog[],
        lastReviewed: row.lastReviewed ? new Date(row.lastReviewed * 1000) : undefined,
        nextReview: new Date(row.nextReview * 1000),
        createdAt: new Date(
            (row.createdAt ?? Math.floor(Date.now() / 1000)) * 1000
        ),
        updatedAt: new Date(
            (row.updatedAt ?? Math.floor(Date.now() / 1000)) * 1000
        ),
    }));
}

export async function getNewVocabulary(): Promise<VocabTable[]> {
    const existing = await db.select({ vocabularyId: flashcards.vocabularyId }).from(flashcards);
    const existingIds = existing.map((e) => e.vocabularyId);

    const vocabItems = existingIds.length
        ? await db.select().from(vocabulary).where(
            not(inArray(vocabulary.id, existingIds)) // all vocab not in flashcards
        )
        : await db.select().from(vocabulary);

    return vocabItems;
}

export async function updateCards(cards: FlashcardData[]): Promise<void> {
    try {
        const flashcardData = cards.map(card => ({
            id: card.id,
            vocabularyId: card.vocabularyId,
            fsrsCard: card.fsrsCard,
            reviewHistory: card.reviewHistory,
            lastReviewed: card.lastReviewed ? Math.floor(card.lastReviewed.getTime() / 1000) : null,
            nextReview: Math.floor(card.nextReview.getTime() / 1000),
            createdAt: Math.floor(card.createdAt.getTime() / 1000),
            updatedAt: Math.floor(card.updatedAt.getTime() / 1000),
        }));

        await db.insert(flashcards).values(flashcardData);
    } catch (error) {
        console.error("Error updating cards in database:", error);
        throw error;
    }
}

