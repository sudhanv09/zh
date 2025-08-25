import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

export const vocabulary = sqliteTable('vocabulary', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  vocabulary: text('vocabulary').notNull(),
  pinyin: text('pinyin').notNull(),
  level: text('level'),
  source: text('source').notNull(),
  definition: text('definition'),
  examples: text('examples'),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
});

export const flashcards = sqliteTable('flashcards', {
  id: text('id').primaryKey(),
  vocabularyId: integer('vocabulary_id').notNull().references(() => vocabulary.id, { onDelete: 'cascade' }),
  fsrsCard: text('fsrs_card', { mode: 'json' }).notNull(),
  reviewHistory: text('review_history', { mode: 'json' }).notNull().default(sql`(json_array())`),
  lastReviewed: integer('last_reviewed').default(sql`(current_timestamp)`),
  nextReview: integer('next_review').notNull().default(sql`(strftime('%s', 'now'))`),
  createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at').default(sql`(strftime('%s', 'now'))`),
});

export const vocabularyRelations = relations(vocabulary, ({ many }) => ({
  flashcards: many(flashcards),
}));

export const flashcardRelations = relations(flashcards, ({ one }) => ({
  vocabulary: one(vocabulary, {
    fields: [flashcards.vocabularyId],
    references: [vocabulary.id],
  }),
}));