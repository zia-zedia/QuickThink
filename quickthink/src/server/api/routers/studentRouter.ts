import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
} from "../trpc";
import {
  courses,
  organizations,
  results,
  tests,
  user_courses,
  user_org,
  users,
} from "~/drizzle/schema";
import { eq, or } from "drizzle-orm";

export const studentRouter = createTRPCRouter({
  getResults: authenticatedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(results)
      .leftJoin(tests, eq(tests.id, results.testId))
      .where(eq(results.studentId, ctx.user?.id!));
  }),
  getTestList: authenticatedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(tests)
      .leftJoin(organizations, eq(tests.organizationId, organizations.id))
      .leftJoin(user_org, eq(user_org.organizationId, organizations.id))
      .leftJoin(users, eq(users.id, user_org.userId))
      .where(eq(users.id, ctx.user?.id!));
  }),
  getCourses: authenticatedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(courses)
      .leftJoin(organizations, eq(courses.organzationId, organizations.id))
      .leftJoin(user_org, eq(user_org.organizationId, organizations.id))
      .leftJoin(users, eq(users.id, user_org.userId))
      .leftJoin(user_courses, eq(user_courses.userId, users.id))
      .where(
        or(eq(users.id, ctx.user?.id!), eq(user_courses.userId, ctx.user?.id!)),
      );
  }),
  getCourseContents: authenticatedProcedure
    .input(z.object({ course_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const course = await ctx.db
        .select()
        .from(courses)
        .where(eq(courses.id, input.course_id));

      const courseTests = await ctx.db
        .select()
        .from(tests)
        .where(eq(tests.courseId, input.course_id));
      return { course: course[0], tests: courseTests };
    }),
  getResult: publicProcedure
    .input(z.object({ result_id: z.string() }))
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
});
