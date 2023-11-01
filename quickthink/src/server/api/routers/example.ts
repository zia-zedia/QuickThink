import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { authenticatedProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { supabase } from "~/server/auth/auth";
import { Test, tests } from "~/drizzle/schema";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getTests: publicProcedure.query(async ({ ctx }) => {
    const db = ctx.db;
    const allTests = await db.select().from(tests);
    return { tests: allTests };
  }),
  createUser: publicProcedure.input(z.object({ email: z.string().email(), password: z.string() })).mutation(async ({ ctx, input }) => {
    const supabase = ctx.supabase;
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password
    })
    return { newUser: data }
  }),
  loginUser: publicProcedure.input(z.object({ email: z.string().email(), password: z.string() })).mutation(async ({ ctx, input }) => {
    const supabase = ctx.supabase;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password
    })
    console.log(data)
    if (data.user != null && data.session != null) {
      return { user: data.user, session: data.session }
    }
    throw new TRPCError({ code: "NOT_FOUND" })
  }),
  lockedProcedure: authenticatedProcedure.input(z.object({ name: z.string() })).query(async ({ ctx, input }) => {
    return { hiName: `hi ${input.name}` }
  }),
});
