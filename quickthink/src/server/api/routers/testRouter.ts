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
        .returning();

      const time = await db
        .select({ timeLength: tests.timeLength })
        .from(tests)
        .where(eq(tests.id, input.test_id));

      console.log(newSession[0]?.startTime?.getTime());

      return { session: newSession[0], time: time };
    }),
  checkSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = ctx.db;
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, input.sessionId));
      if (session.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const time = await db
        .select({ timeLength: tests.timeLength })
        .from(tests)
        .where(eq(tests.id, session[0]?.testId!));

      console.log(time[0]?.timeLength);

      return { session: session[0], time: time };
    }),
});
