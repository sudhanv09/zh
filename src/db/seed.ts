import { db } from "./index";
import { vocabulary } from "./schema";
import { VocabularySource, type VocabularyItem } from "~/types/flashcard";
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
        const ts = Math.floor(Date.now() / 1000)


        const BATCH_SIZE = 200;
        for (let i = 0; i < vocabularyData.length; i += BATCH_SIZE) {
            const batch = vocabularyData.slice(i, i + BATCH_SIZE);

            await db.insert(vocabulary).values(
                batch.map(item => ({
                    vocabulary: item.vocabulary,
                    pinyin: item.pinyin,
                    level: item.level,
                    source: VocabularySource.TOCFL,
                    definition: item.definition ?? "",
                    examples: item.examples ?? "",
                    createdAt: ts,
                }))
            );
        }
        

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
        throw error;
    }
}

seedDatabase()