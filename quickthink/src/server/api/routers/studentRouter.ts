import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
} from "../trpc";
import { tests } from "~/drizzle/schema";

export const studentRouter = createTRPCRouter({
  getTestList: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(tests);
  }),
});
