import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { tests } from "~/drizzle/schema";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { supabase } from "~/server/auth/auth";

export const dashboardRouter = createTRPCRouter({
  getCompleteTests: publicProcedure.query(async ({ ctx }) => {
    const db = ctx.db;
    const joinedTable = await db
      .select({ id: tests.id, title: tests.title, category: categories.name })
      .from(tests)
      .leftJoin(categories, eq(tests.categoryId, categories.id));
    return {
      tests: joinedTable,
    };
  }),
});
