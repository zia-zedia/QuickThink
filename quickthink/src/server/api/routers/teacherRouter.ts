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
  getTestList: teacherProcedure.query(async ({ ctx }) => {
    console.log("running teacher procedure");
    console.log(ctx.user.data.user?.id);
    return await ctx.db
      .select()
      .from(tests)
      .leftJoin(teacher_test, eq(tests.id, teacher_test.teacherId))
      .leftJoin(users, eq(users.id, teacher_test.teacherId))
      .where(eq(users.authId, ctx.user.data.user?.id!));
  }),
});
