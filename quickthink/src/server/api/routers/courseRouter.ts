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
  deleteCourse: teacherProcedure
    .input(z.object({ course_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db
        .select({ userId: courses.creatorId })
        .from(courses)
        .where(eq(courses.id, input.course_id));
      if (ctx.user?.id !== course[0]?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the creator of this course",
        });
      }

      return await ctx.db
        .delete(courses)
        .where(eq(courses.id, input.course_id));
    }),
  updateCourseData: teacherProcedure
    .input(
      z.object({
        course_id: z.string().uuid(),
        name: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db
        .select({ userId: courses.creatorId })
        .from(courses)
        .where(eq(courses.id, input.course_id));
      if (ctx.user?.id !== course[0]?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the creator of this course",
        });
      }

      return await ctx.db
        .update(courses)
        .set({ name: input.name, description: input.description })
        .where(eq(courses.id, input.course_id));
    }),
  addCourse: teacherProcedure.mutation(async ({ ctx }) => {
    return await ctx.db.insert(courses).values({
      name: "New Course",
      description: "Describe your course",
      creatorId: ctx.user?.id,
    });
  }),
  removeTestFromCourse: teacherProcedure
    .input(
      z.object({ test_id: z.string().uuid(), course_id: z.string().uuid() }),
    )
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db
        .select({ userId: courses.creatorId })
        .from(courses)
        .where(eq(courses.id, input.course_id));
      if (ctx.user?.id !== course[0]?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the creator of this course",
        });
      }
      return await ctx.db
        .update(tests)
        .set({ courseId: null })
        .where(eq(tests.id, input.test_id));
    }),
  addTestsToCourse: teacherProcedure
    .input(z.object({ course_id: z.string().uuid(), tests: z.array(ZodTest) }))
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db
        .select({ userId: courses.creatorId })
        .from(courses)
        .where(eq(courses.id, input.course_id));
      if (ctx.user?.id !== course[0]?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the creator of this course",
        });
      }

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
  getCourseTests: teacherProcedure
    .input(z.object({ course_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(tests)
        .where(and(isNull(tests.courseId), eq(tests.teacherId, ctx.user?.id!)));
    }),
  removeParticipant: teacherProcedure
    .input(
      z.object({ course_id: z.string().uuid(), user_id: z.string().uuid() }),
    )
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db
        .select({ userId: courses.creatorId })
        .from(courses)
        .where(eq(courses.id, input.course_id));
      if (ctx.user?.id !== course[0]?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the creator of this course",
        });
      }

      return await ctx.db
        .delete(user_courses)
        .where(
          and(
            eq(user_courses.courseId, input.course_id),
            eq(user_courses.userId, input.user_id),
          ),
        );
    }),
  getParticipants: teacherProcedure
    .input(z.object({ course_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db
        .select({ userId: courses.creatorId })
        .from(courses)
        .where(eq(courses.id, input.course_id));
      if (ctx.user?.id !== course[0]?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the creator of this course",
        });
      }

      return await ctx.db
        .select()
        .from(user_courses)
        .leftJoin(users, eq(user_courses.userId, users.id))
        .leftJoin(courses, eq(user_courses.courseId, courses.id))
        .where(and(eq(courses.id, input.course_id), eq(users.role, "student")));
    }),
  addParticipant: teacherProcedure
    .input(
      z.object({
        username: z.string().min(5).max(15),
        course_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const course = await ctx.db
        .select({ userId: courses.creatorId })
        .from(courses)
        .where(eq(courses.id, input.course_id));
      if (ctx.user?.id !== course[0]?.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the creator of this course",
        });
      }
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

      const courseParticipants = await ctx.db
        .select({ userId: user_courses.userId })
        .from(user_courses)
        .where(
          and(
            eq(user_courses.courseId, input.course_id),
            eq(user_courses.userId, user[0]?.id!),
          ),
        );

      if (courseParticipants.length >= 1) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already added.",
        });
      }

      return await ctx.db
        .insert(user_courses)
        .values({ userId: user[0]!.id, courseId: input.course_id })
        .returning();
    }),
});
