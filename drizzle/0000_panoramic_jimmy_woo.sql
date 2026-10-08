CREATE TABLE `user_feeds` (
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
CREATE INDEX `idx_user_feeds_ca` ON `user_feeds` (`ca`);--> statement-breakpoint
CREATE INDEX `idx_user_feeds_ua` ON `user_feeds` (`ua`);--> statement-breakpoint
CREATE INDEX `idx_user_feeds_fn` ON `user_feeds` (`fn`);--> statement-breakpoint
CREATE INDEX `idx_user_feeds_ln` ON `user_feeds` (`ln`);--> statement-breakpoint
CREATE INDEX `idx_user_feeds_np` ON `user_feeds` (`np`);--> statement-breakpoint
CREATE INDEX `idx_user_feeds_filter_matrix` ON `user_feeds` (`ms`,`ai`,`db`);