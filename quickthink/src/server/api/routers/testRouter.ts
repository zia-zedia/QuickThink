import { TRPCError } from "@trpc/server";
import { create } from "domain";
import { and, eq } from "drizzle-orm";
import { Input } from "postcss";
import { z } from "zod";
import { sessions, tests } from "~/drizzle/schema";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
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
  startSession: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      const newSession = await db
        .insert(sessions)
        .values({ testId: input.test_id })
        .returning({ sessionId: sessions.id });

      return newSession;
    }),
  checkSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
      }),
    )
<<<<<<< HEAD
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, input.sessionId));
      if (session.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return session;
=======
    .mutation(({ ctx, input }) => {
      const testSession = ctx.testSessions;
      console.log(testSession);
      testSession.set(
        { test_id: input.test_id, user_id: input.user_id },
        new Date(),
      );
      console.log(testSessions);
      return { something: "something" };
>>>>>>> adaf2b9a06dd5c070ac88caf87b9e6d1f990e742
    }),
});
