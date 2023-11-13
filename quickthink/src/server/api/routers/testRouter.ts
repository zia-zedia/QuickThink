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
    .mutation(async ({ ctx, input }) => {
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
  getTestIntroWithId: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
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
    .mutation(async ({ ctx, input }) => {
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
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const maxTestTime =
        session[0]?.startTime!.getTime()! + Number(session[0]?.testTimeLength);
      if (Date.now() > maxTestTime) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Your session has run out.",
        });
      }

      return session;
    }),
});
