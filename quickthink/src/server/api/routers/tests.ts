import { Answer, answers, questions, tests, Question } from "~/drizzle/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { warn } from "console";

export const testRouter = createTRPCRouter({
  getFullTest: publicProcedure
    .input(z.object({ test_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const testData = await db.select().from(tests).where(eq(tests.id, Number(input.test_id)));
      return { test: testData[0] };
    }),
  getQuestions: publicProcedure
    .input(z.object({ test_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = ctx.db;
      const testQuestions = await db.select().from(questions).where(eq(questions.testId, Number(input.test_id)))

      const testAnswers = await Promise.all(testQuestions.map(async (question) => {
        const questionAnswers = await db.select().from(answers).where(eq(answers.questionId, question.id));
        return questionAnswers;
      }));

      const qnaArray = new Array<{ question: Question, answers: Answer[] }>()
      for (let i = 0; i < testQuestions.length; i++) {
        qnaArray.push({ question: testQuestions[i]!, answers: testAnswers[i]! });
      }
      return { QnA: qnaArray };
    }),
});
