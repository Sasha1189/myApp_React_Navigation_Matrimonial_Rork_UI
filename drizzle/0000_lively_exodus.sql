CREATE TABLE `sql_profile_table` (
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
CREATE INDEX `idx_ca` ON `sql_profile_table` (`ca`);--> statement-breakpoint
CREATE INDEX `idx_ua` ON `sql_profile_table` (`ua`);--> statement-breakpoint
CREATE INDEX `idx_fn` ON `sql_profile_table` (`fn`);--> statement-breakpoint
CREATE INDEX `idx_ln` ON `sql_profile_table` (`ln`);--> statement-breakpoint
CREATE INDEX `idx_np` ON `sql_profile_table` (`np`);--> statement-breakpoint
CREATE INDEX `idx_filter_matrix` ON `sql_profile_table` (`ms`,`ai`,`db`);