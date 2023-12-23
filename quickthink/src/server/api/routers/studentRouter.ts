import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
} from "../trpc";
import { courses, results, tests } from "~/drizzle/schema";
import { eq } from "drizzle-orm";

export const studentRouter = createTRPCRouter({
  getTestList: authenticatedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(tests);
  }),
  getCourses: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(courses);
  }),
  getCourseContents: publicProcedure
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
