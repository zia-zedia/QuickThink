import { pgTable, foreignKey, pgEnum, serial, integer, text, boolean, index, timestamp, uuid, pgSchema } from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"

export const answers = pgTable("answers", {
	id: serial("id").primaryKey().notNull(),
	questionId: integer("question_id").references(() => questions.id),
	value: text("value"),
	isCorrect: boolean("is_correct"),
});

export const categories = pgTable("categories", {
	id: serial("id").primaryKey().notNull(),
	name: text("name"),
});

export const questions = pgTable("questions", {
	id: serial("id").primaryKey().notNull(),
	value: text("value"),
	testId: integer("test_id").references(() => tests.id),
	answerAmount: integer("answer_amount"),
});

export const resultAnswers = pgTable("result_answers", {
	id: serial("id").primaryKey().notNull(),
	resultId: integer("result_id").references(() => results.id),
	questionId: integer("question_id").references(() => questions.id),
	answerId: integer("answer_id").references(() => answers.id),
},
	(table) => {
		return {
			resultIdx: index("result_idx").on(table.id),
		}
	});

export const results = pgTable("results", {
	id: serial("id").primaryKey().notNull(),
	testId: integer("test_id").references(() => tests.id),
	completedAt: text("completed_at").default('yeah'),
	grade: integer("grade"),
});

export const tests = pgTable("tests", {
	id: serial("id").primaryKey().notNull(),
	title: text("title"),
	description: text("description"),
	categoryId: integer("category_id").references(() => categories.id),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	userId: integer("user_id").references(() => users.id),
});

export const roleEnum = pgEnum("role", ["teacher", "student", "admin"])

export const users = pgTable("users", {
	id: serial("id").primaryKey().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	authId: uuid("auth_id"),
	role: roleEnum("role")
});

export type Test = typeof tests.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Answer = typeof answers.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type UserInsert = typeof users.$inferInsert
