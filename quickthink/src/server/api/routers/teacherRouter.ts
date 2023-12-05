import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
  teacherProcedure,
} from "../trpc";
import { courses, teacher_test, tests, users } from "~/drizzle/schema";
import { eq } from "drizzle-orm";

export const teacherRouter = createTRPCRouter({
  getTestList: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(tests)
      .leftJoin(users, eq(tests.teacherId, users.id));
  }),
});
