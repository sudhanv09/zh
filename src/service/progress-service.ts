import { db } from "~/db";
import { flashcards } from "~/db/schema";
import { sql, desc, gte } from "drizzle-orm";

export async function getDaysReviewedCount(): Promise<number> {
  try {
    // Get unique dates where cards were reviewed in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db
      .select({
        reviewDate: sql`DATE(last_reviewed / 1000, 'unixepoch') as review_date`
      })
      .from(flashcards)
      .where(gte(flashcards.lastReviewed, Math.floor(thirtyDaysAgo.getTime() / 1000)))
      .groupBy(sql`DATE(last_reviewed / 1000, 'unixepoch')`);

    return result.length;
  } catch (error) {
    console.error("Error getting days reviewed count:", error);
    return 0;
  }
}

export async function getCurrentLevel(): Promise<string> {
  try {
    // Get the most recent level from cards that have been reviewed
    const result = await db
      .select({
        level: flashcards.level
      })
      .from(flashcards)
      .where(sql`${flashcards.lastReviewed} IS NOT NULL`)
      .orderBy(desc(flashcards.lastReviewed))
      .limit(1);

    return result.length > 0 ? result[0].level : "Beginner";
  } catch (error) {
    console.error("Error getting current level:", error);
    return "Beginner";
  }
}

export async function getDifficultWords(): Promise<Array<{
  vocabulary: string;
  pinyin: string;
  difficulty: number;
}>> {
  try {
    // Get words that have been reviewed most frequently (indicating difficulty)
    const result = await db
      .select({
        id: flashcards.id,
        vocabulary: flashcards.vocabulary,
        pinyin: flashcards.pinyin,
        difficultyCount: sql`COUNT(*)`.as('difficulty_count')
      })
      .from(flashcards)
      .where(sql`${flashcards.lastReviewed} IS NOT NULL`)
      .groupBy(flashcards.id, flashcards.vocabulary, flashcards.pinyin)
      .orderBy(sql`difficulty_count DESC`)
      .limit(5);

    return result.map(item => ({
      vocabulary: item.vocabulary,
      pinyin: item.pinyin,
      difficulty: item.difficultyCount as number
    }));
  } catch (error) {
    console.error("Error getting difficult words:", error);
    return [];
  }
}

export async function getReviewHistory(): Promise<Array<{
  date: string;
  count: number;
}>> {
  try {
    // Get review history for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const result = await db
      .select({
        reviewDate: sql`DATE(last_reviewed / 1000, 'unixepoch') as review_date`,
        count: sql`COUNT(*) as review_count`
      })
      .from(flashcards)
      .where(gte(flashcards.lastReviewed, Math.floor(sevenDaysAgo.getTime() / 1000)))
      .groupBy(sql`DATE(last_reviewed / 1000, 'unixepoch')`)
      .orderBy(sql`review_date ASC`);

    // Fill in missing dates with 0 reviews
    const allDates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      allDates.push(dateStr);
    }

    const historyMap = new Map(result.map(item => [item.reviewDate, item.count]));
    
    return allDates.map(date => ({
      date,
      count: (historyMap.get(date) as number) || 0
    }));
  } catch (error) {
    console.error("Error getting review history:", error);
    return [];
  }
}

export async function getTotalCardsReviewed(): Promise<number> {
  try {
    const result = await db
      .select({
        totalCount: sql`COUNT(*)`.as('total_count')
      })
      .from(flashcards)
      .where(sql`${flashcards.lastReviewed} IS NOT NULL`);

    return result.length > 0 ? (result[0].totalCount as number) : 0;
  } catch (error) {
    console.error("Error getting total cards reviewed:", error);
    return 0;
  }
}