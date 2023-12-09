import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
  teacherProcedure,
} from "../trpc";
import {
  ZodAnswer,
  ZodInsertQuestion,
  ZodInsertTest,
  ZodQuestion,
  courses,
  tests,
  users,
} from "~/drizzle/schema";
import { eq } from "drizzle-orm";

export const teacherRouter = createTRPCRouter({
  getTestList: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(tests)
      .leftJoin(users, eq(tests.teacherId, users.id));
  }),
  saveDraft: publicProcedure
    .input(
      z.object({
        test: ZodInsertTest,
        draft: z.array(
          z.object({
            question: ZodInsertQuestion,
            answers: z.array(ZodInsertQuestion),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      console.log(input.draft);
      console.log(input.test);
    }),
});
