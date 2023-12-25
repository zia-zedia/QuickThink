import { number, z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
  teacherProcedure,
} from "../trpc";
import { courses, user_courses, users } from "~/drizzle/schema";
import { and, eq } from "drizzle-orm";
import test from "node:test";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { contextProps } from "@trpc/react-query/shared";

export const courseRouter = createTRPCRouter({
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
