import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  answers,
  questions,
  sessions,
  tests,
  Question,
  Answer,
  ZodQuestion,
  ZodAnswer,
  results,
  TestType,
  AnswerType,
  ZodResultInsert,
  ZodAnswerSubmit,
  ResultInsert,
} from "~/drizzle/schema";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

export const testRouter = createTRPCRouter({
  getTestDataForTest: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const testQuery = await db
        .select({
          question: questions,
          answers: {
            id: answers.id,
            content: answers.content,
            questionId: answers.questionId,
            isCorrect: answers.isCorrect,
          },
        })
        .from(questions)
        .leftJoin(answers, eq(answers.questionId, questions.id))
        .where(eq(questions.testId, input.test_id));

      const testQuestions = Object.values(
        testQuery.reduce<
          Record<number, { question: Question; answers: Answer[] }>
        >((acc, row) => {
          const question = row.question;
          const answers = row.answers;

          if (!acc[question.id]) {
            acc[question.id] = { question, answers: [] };
          }
          if (answers) {
            acc[question.id]?.answers.push(answers);
          }
          return acc;
        }, {}),
      );

      return testQuestions;
    }),
  getTestDataWithId: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const testQuery = await db
        .select({
          question: questions,
          answers: {
            id: answers.id,
            content: answers.content,
            questionId: answers.questionId,
            isCorrect: answers.isCorrect,
          },
        })
        .from(questions)
        .leftJoin(answers, eq(answers.questionId, questions.id))
        .where(eq(questions.testId, input.test_id));

      const testQuestions = Object.values(
        testQuery.reduce<
          Record<number, { question: Question; answers: Answer[] }>
        >((acc, row) => {
          const question = row.question;
          const answers = row.answers;

          if (!acc[question.id]) {
            acc[question.id] = { question, answers: [] };
          }
          if (answers) {
            acc[question.id]?.answers.push(answers);
          }
          return acc;
        }, {}),
      );

      return testQuestions;
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
        .where(
          and(
            eq(sessions.id, input.sessionId),
            eq(sessions.testId, input.test_id),
          ),
        )
        .leftJoin(tests, eq(sessions.testId, tests.id));
      if (session.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "We haven't found this session for this test",
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
  submitTest: publicProcedure
    .input(
      z.object({
        testId: z.string().uuid(),
        TestAnswers: z.array(
          z.object({
            question: ZodQuestion,
            answers: z.array(ZodAnswerSubmit),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      let totalGrade = input.TestAnswers.reduce((acc, QnA) => {
        return acc + QnA.question.grade;
      }, 0);
      let finalGrade = 0;
      const calculateAnswer = input.TestAnswers.map(async (QnA) => {
        const correctAnswers = await db
          .select({ id: answers.id, isCorrect: answers.isCorrect })
          .from(answers)
          .where(
            and(
              eq(answers.questionId, QnA.question.id),
              eq(answers.isCorrect, true),
            ),
          );
        QnA.answers.map((answer) => {
          correctAnswers.map((correctAnswer) => {
            if (correctAnswer.id === answer.id) {
              finalGrade += QnA.question.grade;
            }
          });
        });
      });
      const finalResult = Promise.all(calculateAnswer).then(async () => {
        const finalResult: ResultInsert = {
          testId: input.testId,
          grade: finalGrade / totalGrade,
        };
        const newResult = await db
          .insert(results)
          .values(finalResult)
          .returning();
        console.log(newResult[0]?.grade);
        return { result: newResult[0] };
      });
      if (!finalResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An issue occured while trying to submit your result",
        });
      }
      return finalResult;
    }),
});

function GradeTest(
  testAnswers: Array<{ question: Question; answers: AnswerType[] }>,
) {
  const maxGrade = testAnswers.reduce((acc, curr) => {
    return acc + curr.question.grade!;
  }, 0);
  const correctAnswers = testAnswers.map((value) => {});
  console.log(correctAnswers.length);
  console.log(maxGrade);
}

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
