import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const flashcards = sqliteTable('flashcards', {
  id: text('id').primaryKey(),
  vocabulary: text("vocabulary").notNull(),
  pinyin: text("pinyin").notNull(),
  level: text("level").notNull(),

  fsrsCard: text('fsrs_card', { mode: 'json' }).notNull(),
  reviewHistory: text('review_history', { mode: 'json' }).notNull().default(sql`(json_array())`),

  lastReviewed: integer('last_reviewed').default(sql`(current_timestamp)`),
  nextReview: integer('next_review').notNull().default(sql`(strftime('%s', 'now'))`),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`)
});