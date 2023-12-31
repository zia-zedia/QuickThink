import { randomUUID } from "crypto";
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
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const organizations = pgTable("organization", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name"),
  creatorId: uuid("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
});

export const roleEnum = pgEnum("roles", ["student", "teacher", "admin"]);
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userName: varchar("user_name", { length: 15 }).unique().notNull(),
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

export const difficultyEnum = pgEnum("difficulty", ["EASY", "MED", "HARD"]);
export const visibilityEnum = pgEnum("visibility", [
  "draft",
  "public",
  "organization",
]);

export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: text("title").notNull().default(""),
  description: text("description"),
  organizationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "set null",
  }),
  timeLength: integer("time_length").default(300),
  publishedAt: timestamp("published_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  difficulty: difficultyEnum("difficulty").default("EASY"),
  visibility: visibilityEnum("visibility").default("public"),
  teacherId: uuid("teacher_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  courseId: uuid("course_id").references(() => courses.id, {
    onDelete: "set null",
  }),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey().notNull(),
  content: text("content"),
  testId: uuid("test_id").references(() => tests.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  grade: integer("grade").notNull().default(1),
  sequence: integer("sequence"),
  answerAmount: integer("answer_amount").default(1),
});

export const answers = pgTable("answers", {
  id: serial("id").primaryKey().notNull(),
  content: text("content"),
  questionId: integer("question_id")
    .references(() => questions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  isCorrect: boolean("is_correct"),
});

export const results = pgTable("results", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  testId: uuid("test_id")
    .references(() => tests.id, { onDelete: "cascade" })
    .notNull(),
  studentId: uuid("student_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  grade: real("grade"),
});

export const result_answers = pgTable("result_answers", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  resultId: uuid("result_id").references(() => results.id, {
    onDelete: "cascade",
  }),
  questionId: integer("question_id").references(() => questions.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  answerId: integer("answer_id").references(() => answers.id, {
    onDelete: "cascade",
  }),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  testId: uuid("test_id")
    .references(() => tests.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time").notNull(),
});

export const user_org = pgTable("user_organization", {
  id: serial("id").primaryKey().notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
});

export const user_courses = pgTable("user_courses", {
  id: serial("id").primaryKey().notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
});

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  creatorId: uuid("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  organzationId: uuid("organization_id").references(() => organizations.id, {
    onDelete: "cascade",
  }),
  name: text("course_name").notNull(),
  description: text("description"),
});

export const UserInsert = createInsertSchema(users);
export const ZodInsertTest = createInsertSchema(tests);
export const ZodTest = createSelectSchema(tests);
export const ZodQuestion = createSelectSchema(questions);
export const ZodAnswer = createSelectSchema(answers);
export const ZodInsertQuestion = createInsertSchema(questions);
export const ZodInsertAnswer = createInsertSchema(answers);
export const ZodResultInsert = createInsertSchema(results);
export const ZodAnswerSubmit = createInsertSchema(answers).omit({
  isCorrect: true,
});
export type TestInsert = typeof tests.$inferInsert;
export type TestType = typeof tests.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;
export type Question = typeof questions.$inferInsert;
export type Answer = Omit<typeof answers.$inferInsert, "isCorrect">;
export type AnswerType = typeof answers.$inferInsert;
export type ResultInsert = typeof results.$inferInsert;
export type CourseType = typeof courses.$inferSelect;
export type UserType = typeof users.$inferSelect;
export type OrganizationType = typeof organizations.$inferSelect;
export type ResultAnswerInsert = typeof result_answers.$inferInsert;
