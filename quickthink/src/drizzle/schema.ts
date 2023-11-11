import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  boolean,
  index,
  timestamp,
  uuid,
  real,
  primaryKey,
  interval,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const organization = pgTable("organization", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name"),
});

export const roleEnum = pgEnum("roles", ["student", "teacher", "admin"]);
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    role: roleEnum("roles"),
    authId: uuid("auth_id"),
  },
  (table) => {
    return {
      authIdx: index("auth_idx").on(table.authId),
    };
  },
);
/*
export const user_org = pgTable(
  "user_organization",
  {
    userId: uuid("user_id").references(() => users.id),
    organizationId: uuid("organization_id").references(() => organization.id),
  },
  (table) => {
    return {
      pk: primaryKey(table.userId, table.organizationId),
    };
  },
);
*/

export const difficultyEnum = pgEnum("difficulty", ["EASY", "MED", "HARD"]);
export const visibilityEnum = pgEnum("visibility", [
  "public",
  "private",
  "organization",
]);
export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title").notNull().default(""),
  description: text("description"),
  organizationId: uuid("organization_id").references(() => organization.id),
  timeLength: interval("time_length", { fields: "second" }).default("300"),
  publishedAt: timestamp("published_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  difficulty: difficultyEnum("difficulty").default("EASY"),
  visibility: visibilityEnum("visibility").default("public"),
});

export const teacher_test = pgTable("teacher_test", {
  teacherId: uuid("teacher_id").references(() => users.id),
  testId: uuid("test_id").references(() => tests.id),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey().notNull(),
  content: text("content"),
  testId: uuid("test_id").references(() => tests.id),
  answerAmount: integer("answer_amount"),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey().notNull(),
  content: text("content"),
  questionId: integer("question_id")
    .references(() => questions.id)
    .notNull(),
  isCorrect: boolean("is_correct"),
});

export const results = pgTable("results", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  testId: uuid("test_id").references(() => tests.id),
  studentId: uuid("student_id").references(() => users.id),
  grade: real("grade"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  testId: uuid("test_id").references(() => tests.id),
  startTime: timestamp("start_time").defaultNow(),
});

export const UserInsert = createInsertSchema(users);
export type TestType = typeof tests.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;
