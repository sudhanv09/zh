import { db } from "~/db";
import { flashcards } from "~/db/schema";
import { type FlashcardData, DEFAULT_DAILY_GOAL } from "~/types/flashcard";

export async function cardsToReview(): Promise<FlashcardData[]> {
    try {
        const flashcardData = await getAllFlashcards();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cardsToReview = flashcardData.filter((card: FlashcardData) => {
            const nextReview = new Date(card.nextReview);
            nextReview.setHours(0, 0, 0, 0);
            return nextReview <= today;
        });

        return cardsToReview.slice(0, DEFAULT_DAILY_GOAL);
    } catch (error) {
        console.error("Error transforming vocabulary to flashcard data:", error);
        return [];
    }
}