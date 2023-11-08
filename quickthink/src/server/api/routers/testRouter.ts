import { TRPCError } from "@trpc/server";
import { create } from "domain";
import { eq } from "drizzle-orm";
import { Input } from "postcss";
import { z } from "zod";
import { tests } from "~/drizzle/schema";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { testSessions } from "~/server/timer/timer";

export const testRouter = createTRPCRouter({
  getTestWithId: publicProcedure
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
  startTestSession: publicProcedure
    .input(
      z.object({
        test_id: z.string(),
        user_id: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const testSession = ctx.testSessions;
      console.log(testSession);
      testSession.set(
        { test_id: input.test_id, user_id: input.user_id },
        new Date(),
      );
      console.log(testSessions);
      return { something: "something" };
    }),
});
