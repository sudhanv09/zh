import { db } from "./index";
import { transformToFlashcard } from "../service/vocabulary-loader";
import { flashcards } from "./schema";
import type { VocabularyItem } from "../types/flashcard";
import process from "process";
import path from "path";
import { promises as fs } from "fs";


async function getVocabularyData(): Promise<VocabularyItem[]> {
    const wordlistPath = path.join(process.cwd(), "assets", "tocfl_wordlist.json")
    const fileContent = await fs.readFile(wordlistPath, "utf-8");
    const res = JSON.parse(fileContent)

    return res as VocabularyItem[]
}

export async function seedDatabase() {
    try {
        const vocabularyData = await getVocabularyData();
        const flashcardsData = vocabularyData.map(transformToFlashcard);

        const dbFlashcards = flashcardsData.map(card => ({
            ...card,
            lastReviewed: card.lastReviewed ? Math.floor(card.lastReviewed.getTime() / 1000) : null,
            nextReview: Math.floor(card.nextReview.getTime() / 1000),
        }));

        const batchSize = 200;
        for (let i = 0; i < dbFlashcards.length; i += batchSize) {
            const batch = dbFlashcards.slice(i, i + batchSize);
            await db.insert(flashcards).values(batch);
        }

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }
}

seedDatabase()