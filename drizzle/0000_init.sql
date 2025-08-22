CREATE TABLE `flashcards` (
	`id` text PRIMARY KEY NOT NULL,
	`vocabulary` text NOT NULL,
	`pinyin` text NOT NULL,
	`level` text NOT NULL,
	`fsrs_card` text NOT NULL,
	`review_history` text DEFAULT (json_array()) NOT NULL,
	`last_reviewed` integer DEFAULT (current_timestamp),
	`next_review` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` text NOT NULL,
	`rating` integer NOT NULL,
	`review_time` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`review_data` text,
	FOREIGN KEY (`card_id`) REFERENCES `flashcards`(`id`) ON UPDATE no action ON DELETE cascade
);
