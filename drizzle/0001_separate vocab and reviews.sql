CREATE TABLE `vocabulary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`vocabulary` text NOT NULL,
	`pinyin` text NOT NULL,
	`level` text,
	`source` text NOT NULL,
	`definition` text,
	`examples` text,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
ALTER TABLE `flashcards` ADD `vocabulary_id` integer NOT NULL REFERENCES vocabulary(id);--> statement-breakpoint
ALTER TABLE `flashcards` DROP COLUMN `vocabulary`;--> statement-breakpoint
ALTER TABLE `flashcards` DROP COLUMN `pinyin`;--> statement-breakpoint
ALTER TABLE `flashcards` DROP COLUMN `level`;