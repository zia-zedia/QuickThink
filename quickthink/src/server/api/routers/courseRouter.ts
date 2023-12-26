import { number, z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
  teacherProcedure,
} from "../trpc";
import { ZodTest, courses, tests, user_courses, users } from "~/drizzle/schema";
import { and, eq, isNull, not } from "drizzle-orm";
import test from "node:test";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { contextProps } from "@trpc/react-query/shared";

export const courseRouter = createTRPCRouter({
  removeTestFromCourse: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(tests)
        .set({ courseId: null })
        .where(eq(tests.id, input.test_id));
    }),
  addTestsToCourse: publicProcedure
    .input(z.object({ course_id: z.string().uuid(), tests: z.array(ZodTest) }))
    .mutation(async ({ ctx, input }) => {
      const updatedTests = input.tests.map(async (test) => {
        await ctx.db
          .update(tests)
          .set({ courseId: input.course_id })
          .where(and(eq(tests.id, test.id), isNull(tests.courseId)))
          .returning();
      });
      const update = await Promise.all(updatedTests).then(() => {
        return updatedTests;
      });
      return update;
    }),
  getTests: publicProcedure.query(async ({ ctx, input }) => {
    return await ctx.db.select().from(tests);
  }),
  getTeacherTest: teacherProcedure.query(async ({ ctx, input }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return await ctx.db
      .select()
      .from(tests)
      .where(eq(tests.teacherId, ctx.user?.id!));
  }),
  getCourseTests: publicProcedure
    .input(z.object({ course_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(tests)
        .where(eq(tests.courseId, input.course_id));
    }),
  getParticipants: publicProcedure
    .input(z.object({ course_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(user_courses)
        .leftJoin(users, eq(user_courses.userId, users.id))
        .leftJoin(courses, eq(user_courses.courseId, courses.id))
        .where(and(eq(courses.id, input.course_id), eq(users.role, "student")));
    }),
  addParticipant: publicProcedure
    .input(
      z.object({
        username: z.string().min(5).max(15),
        course_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.userName, input.username));

      if (user.length === 0 || !user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Didn't find a user with that username",
        });
      }

      return await ctx.db
        .insert(user_courses)
        .values({ userId: user[0]!.id, courseId: input.course_id })
        .returning();
    }),
});
