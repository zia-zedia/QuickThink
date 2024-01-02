import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
} from "../trpc";
import { courses, results, tests } from "~/drizzle/schema";
import { eq } from "drizzle-orm";

export const studentRouter = createTRPCRouter({
  getResultDetails: publicProcedure
    .input(z.object({ result_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return;
    }),
});
