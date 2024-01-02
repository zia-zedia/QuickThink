import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
} from "../trpc";
import {
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
        .leftJoin(result_answers, eq(result_answers.resultId, results.id))
        .where(eq(results.id, input.result_id));
    }),
});
