import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
} from "../trpc";
import { courses, tests } from "~/drizzle/schema";

export const studentRouter = createTRPCRouter({
  getTestList: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(tests);
  }),
  getCourses: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(courses);
  }),
});
