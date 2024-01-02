import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
} from "../trpc";
import {
  AnswerType,
  Question,
  answers,
  courses,
  questions,
  result_answers,
  results,
  tests,
} from "~/drizzle/schema";
import { eq } from "drizzle-orm";

export const resultRouter = createTRPCRouter({
  getResult: publicProcedure
    .input(z.object({ result_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(results)
        .where(eq(results.id, input.result_id));

      if (result.length === 0) {
        return { result: null, test: null };
      }

      const test = await ctx.db
        .select({ title: tests.title })
        .from(tests)
        .where(eq(tests.id, result[0]?.testId!));

      console.log(result[0]?.grade);
      console.log(test[0]?.title);
      return { result: result[0], test: test[0] };
    }),
  getResultDetails: publicProcedure
    .input(z.object({ result_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(results)
        .where(eq(results.id, input.result_id));

      const testQuery = await ctx.db
        .select({
          question: questions,
          answers: answers,
        })
        .from(questions)
        .leftJoin(answers, eq(answers.questionId, questions.id))
        .where(eq(questions.testId, result[0]?.testId!));

      const resultQuery = await ctx.db
        .select({
          question: questions,
          answers: answers,
        })
        .from(result_answers)
        .leftJoin(questions, eq(questions.testId, result[0]?.testId!))
        .leftJoin(answers, eq(answers.questionId, questions.id))
        .where(eq(result_answers.resultId, input.result_id));

      const test = await ctx.db
        .select()
        .from(tests)
        .where(eq(tests.id, result[0]?.testId!));

      const testQuestion = Object.values(
        testQuery.reduce<
          Record<number, { question: Question; answers: AnswerType[] }>
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

      const studentQuestion = Object.values(
        resultQuery.reduce<
          Record<number, { question: Question; answers: AnswerType[] }>
        >((acc, row) => {
          const question = row.question!;
          const answers = row.answers!;

          if (!acc[question.id]) {
            acc[question.id] = { question, answers: [] };
          }
          if (answers) {
            acc[question.id]?.answers.push(answers);
          }
          return acc;
        }, {}),
      );

      return {
        test: test,
        studentQuestions: studentQuestion,
        testQuestions: testQuestion,
      };
    }),
});
