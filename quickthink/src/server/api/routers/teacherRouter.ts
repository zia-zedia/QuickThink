import { number, z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
  teacherProcedure,
} from "../trpc";
import {
  Answer,
  Question,
  ZodAnswer,
  ZodInsertAnswer,
  ZodInsertQuestion,
  ZodInsertTest,
  ZodQuestion,
  answers,
  courses,
  questions,
  tests,
  users,
} from "~/drizzle/schema";
import { eq } from "drizzle-orm";
import test from "node:test";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { contextProps } from "@trpc/react-query/shared";

export const teacherRouter = createTRPCRouter({
  getTestIntroWithId: authenticatedProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const test = await db
        .select()
        .from(tests)
        .where(eq(tests.id, input.test_id));

      if (test.length > 0) {
        return { testData: test[0] };
      }
      throw new TRPCError({ code: "NOT_FOUND" });
    }),
  publishTest: publicProcedure
    .input(
      z.object({
        test: ZodInsertTest,
        draft: z.array(
          z.object({
            question: ZodInsertQuestion,
            answers: z.array(ZodInsertAnswer),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = ctx.db;

      await db
        .update(tests)
        .set({
          title: input.test.title,
          description: input.test.description,
          timeLength: input.test.timeLength,
          visibility: "public",
        })
        .where(eq(tests.id, input.test.id!));

      input.draft.map(async (QnA, index) => {
        // I used Math.Random for the new questions, so they have to be inbetween 0 and 1
        console.log(QnA.question.id!);
        console.log(QnA.question.content!);
        if (QnA.question.id! >= 1) {
          console.log("updating");
          await db.transaction(async (tx) => {
            await tx
              .update(questions)
              .set({
                content: QnA.question.content,
                sequence: index,
                grade: QnA.question.grade,
                answerAmount: QnA.answers.reduce((acc, cur) => {
                  if (cur.isCorrect) {
                    acc += 1;
                  }
                  return acc;
                }, 0),
              })
              .where(eq(questions.id, QnA.question.id!));

            QnA.answers.map(async (answer) => {
              if (answer.id! >= 1) {
                await tx
                  .update(answers)
                  .set({
                    content: answer.content,
                    isCorrect: answer.isCorrect!,
                  })
                  .where(eq(answers.id, answer.id!));
              } else if (answer.id! > 0 && answer.id! < 1) {
                console.log("inserting answer");
                console.log(answer.content);
                await tx.insert(answers).values({
                  questionId: QnA.question.id!,
                  content: answer.content,
                  isCorrect: answer.isCorrect,
                });
              }
            });
          });
        } else if (QnA.question.id! > 0 && QnA.question.id! < 1) {
          console.log("inserting a new question");
          await db.transaction(async (tx) => {
            const newQuestionId = await tx
              .insert(questions)
              .values({
                content: QnA.question.content,
                sequence: index,
                testId: input.test.id!,
              })
              .returning({ insertedId: questions.id });

            QnA.answers.map(async (answer) => {
              if (answer.id! >= 1) {
                console.log("updating answer");
                tx.update(answers).set({
                  content: answer.content,
                  isCorrect: answer.isCorrect!,
                });
              } else if (answer.id! > 0 && answer.id! < 1) {
                console.log("inserting answer");
                await tx.insert(answers).values({
                  questionId: newQuestionId[0]?.insertedId!,
                  content: answer.content,
                  isCorrect: answer.isCorrect,
                });
              }
            });
          });
        }
      });
    }),
  deleteTest: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(tests)
        .where(eq(tests.id, input.test_id))
        .returning();
    }),
  addTest: publicProcedure.mutation(async ({ ctx }) => {
    return await ctx.db
      .insert(tests)
      .values({
        title: "New Test Draft",
        description: "Describe your test here",
        visibility: "draft",
        difficulty: "EASY",
      })
      .returning();
  }),
  getCourseDataWithId: publicProcedure
    .input(z.object({ course_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db
        .select()
        .from(courses)
        .where(eq(courses.id, input.course_id));
      return { course: course[0] };
    }),
  getCourses: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(courses);
    //.where(eq(courses.creatorId, ctx.user?.id!));
  }),
  getTestList: authenticatedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(tests)
      .leftJoin(users, eq(tests.teacherId, users.id));
  }),
  deleteQuestion: publicProcedure
    .input(z.object({ questionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      /*
      const user = ctx.user;
      console.log(user);
      console.log(user?.role);

      const test = await db
        .select({ teacherId: tests.teacherId })
        .from(tests)
        .leftJoin(questions, eq(questions.testId, tests.id))
        .where(eq(questions.id, input.questionId));

      if (test.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (!(test[0]?.teacherId === user?.id)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      */
      await ctx.db.delete(questions).where(eq(questions.id, input.questionId));
    }),
  deleteAnswer: publicProcedure
    .input(z.object({ answerId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(answers).where(eq(answers.id, input.answerId));
    }),
  saveDraft: publicProcedure
    .input(
      z.object({
        test: ZodInsertTest,
        draft: z.array(
          z.object({
            question: ZodInsertQuestion,
            answers: z.array(ZodInsertAnswer),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = ctx.db;

      await db
        .update(tests)
        .set({
          title: input.test.title,
          description: input.test.description,
          timeLength: input.test.timeLength,
        })
        .where(eq(tests.id, input.test.id!));

      input.draft.map(async (QnA, index) => {
        // I used Math.Random for the new questions, so they have to be inbetween 0 and 1
        console.log(QnA.question.id!);
        console.log(QnA.question.content!);
        if (QnA.question.id! >= 1) {
          console.log("updating");
          await db.transaction(async (tx) => {
            await tx
              .update(questions)
              .set({
                content: QnA.question.content,
                sequence: index,
                grade: QnA.question.grade,
                answerAmount: QnA.answers.reduce((acc, cur) => {
                  if (cur.isCorrect) {
                    acc += 1;
                  }
                  return acc;
                }, 0),
              })
              .where(eq(questions.id, QnA.question.id!));

            QnA.answers.map(async (answer) => {
              if (answer.id! >= 1) {
                await tx
                  .update(answers)
                  .set({
                    content: answer.content,
                    isCorrect: answer.isCorrect!,
                  })
                  .where(eq(answers.id, answer.id!));
              } else if (answer.id! > 0 && answer.id! < 1) {
                console.log("inserting answer");
                console.log(answer.content);
                await tx.insert(answers).values({
                  questionId: QnA.question.id!,
                  content: answer.content,
                  isCorrect: answer.isCorrect,
                });
              }
            });
          });
        } else if (QnA.question.id! > 0 && QnA.question.id! < 1) {
          console.log("inserting a new question");
          await db.transaction(async (tx) => {
            const newQuestionId = await tx
              .insert(questions)
              .values({
                content: QnA.question.content,
                sequence: index,
                testId: input.test.id!,
              })
              .returning({ insertedId: questions.id });

            QnA.answers.map(async (answer) => {
              if (answer.id! >= 1) {
                console.log("updating answer");
                tx.update(answers).set({
                  content: answer.content,
                  isCorrect: answer.isCorrect!,
                });
              } else if (answer.id! > 0 && answer.id! < 1) {
                console.log("inserting answer");
                await tx.insert(answers).values({
                  questionId: newQuestionId[0]?.insertedId!,
                  content: answer.content,
                  isCorrect: answer.isCorrect,
                });
              }
            });
          });
        }
      });
    }),
});
