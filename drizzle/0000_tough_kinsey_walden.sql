CREATE TABLE `free_user_feeds` (
	`uid` text PRIMARY KEY NOT NULL,
	`ca` integer NOT NULL,
	`ua` integer,
	`fn` text,
	`ln` text,
	`db` integer,
	`ht` integer,
	`np` text,
	`ai` integer,
	`ms` integer,
	`ir` text,
	`profile_data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_free_ca` ON `free_user_feeds` (`ca`);--> statement-breakpoint
CREATE INDEX `idx_free_ua` ON `free_user_feeds` (`ua`);--> statement-breakpoint
CREATE INDEX `idx_free_fn` ON `free_user_feeds` (`fn`);--> statement-breakpoint
CREATE INDEX `idx_free_ln` ON `free_user_feeds` (`ln`);--> statement-breakpoint
CREATE INDEX `idx_free_np` ON `free_user_feeds` (`np`);--> statement-breakpoint
CREATE INDEX `idx_free_filter_matrix` ON `free_user_feeds` (`ms`,`ai`,`db`);--> statement-breakpoint
CREATE TABLE `paid_user_feeds` (
	`uid` text PRIMARY KEY NOT NULL,
	`ca` integer NOT NULL,
	`ua` integer,
	`fn` text,
	`ln` text,
	`db` integer,
	`ht` integer,
	`np` text,
	`ai` integer,
	`ms` integer,
	`ir` text,
	`profile_data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_paid_ca` ON `paid_user_feeds` (`ca`);--> statement-breakpoint
CREATE INDEX `idx_paid_ua` ON `paid_user_feeds` (`ua`);--> statement-breakpoint
CREATE INDEX `idx_paid_fn` ON `paid_user_feeds` (`fn`);--> statement-breakpoint
CREATE INDEX `idx_paid_ln` ON `paid_user_feeds` (`ln`);--> statement-breakpoint
CREATE INDEX `idx_paid_np` ON `paid_user_feeds` (`np`);--> statement-breakpoint
CREATE INDEX `idx_paid_filter_matrix` ON `paid_user_feeds` (`ms`,`ai`,`db`);