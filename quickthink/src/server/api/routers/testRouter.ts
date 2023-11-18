import { TRPCError } from "@trpc/server";
import { create } from "domain";
import { and, eq } from "drizzle-orm";
import { Input } from "postcss";
import { z } from "zod";
import {
  Question,
  answers,
  questions,
  sessions,
  tests,
} from "~/drizzle/schema";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const testRouter = createTRPCRouter({
  getTestDataWithId: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;

      const testQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.testId, input.test_id));

      const getTestAnswers = async (questions: Question[]) => {
        questions.forEach((question) => {});
      };
    }),
  getTestQuestions: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const testQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.testId, input.test_id));
      return { questions: testQuestions };
    }),
  getQuestionAnswers: publicProcedure
    .input(z.object({ question_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const questionAnswers = await db
        .select({
          id: answers.id,
          questionId: answers.questionId,
          content: answers.content,
        })
        .from(answers)
        .where(eq(answers.questionId, input.question_id));

      return { answers: questionAnswers };
    }),
  getTestIntroWithId: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const test = await db
        .select({
          title: tests.title,
          description: tests.description,
          publishDate: tests.publishedAt,
        })
        .from(tests)
        .where(eq(tests.id, input.test_id));

      if (test.length > 0) {
        return { testData: test[0] };
      }
      throw new TRPCError({ code: "NOT_FOUND" });
    }),
  startSession: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      console.log("about to add something to the database :)");
      const db = ctx.db;
      const newSession = await db
        .insert(sessions)
        .values({ testId: input.test_id })
        .returning();

      const test = await db
        .select({ testTimeLength: tests.timeLength })
        .from(tests)
        .where(eq(tests.id, input.test_id));

      const maxTestTime = new Date(
        newSession[0]?.startTime!.getTime()! +
          Number(test[0]?.testTimeLength!) * 1000,
      );
      const remainingTime = calculateRemainingTime(maxTestTime);
      console.log(remainingTime);
      return { session: newSession, timer: remainingTime };
    }),
  handleSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid().nullable(),
        test_id: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (!input.sessionId) {
        console.log("hi");
        return { session: null, timer: null };
      }
      const db = ctx.db;
      const session = await db
        .select({
          sessionId: sessions.id,
          startTime: sessions.startTime,
          testTimeLength: tests.timeLength,
        })
        .from(sessions)
        .where(eq(sessions.id, input.sessionId))
        .leftJoin(tests, eq(sessions.testId, tests.id));
      if (session.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your session has run out.",
        });
      }
      const maxTestTime = new Date(
        session[0]?.startTime!.getTime()! +
          Number(session[0]?.testTimeLength) * 1000,
      );
      if (new Date() > maxTestTime) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your session has run out.",
        });
      }
      const remainingTime = calculateRemainingTime(maxTestTime);
      console.log(remainingTime);
      return { session: session, timer: remainingTime };
    }),
});

function calculateRemainingTime(endTime: Date) {
  const currentTime = new Date();
  const timeDifference = endTime.getTime() - currentTime.getTime();

  const seconds = Math.floor((timeDifference / 1000) % 60);
  const minutes = Math.floor((timeDifference / 1000 / 60) % 60);
  const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  const remainingTime = {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };

  return remainingTime;
}
