import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "~/server/db";
import { supabase, user, session } from "../auth/auth";

type CreateContextOptions = Record<string, never>;
const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return {
    db,
    supabase,
    user,
    session,
  };
};
export const createTRPCContext = (_opts: CreateNextContextOptions) => {
  return createInnerTRPCContext({});
};
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});
export const createTRPCRouter = t.router;
const middleware = t.middleware;

const isAuthenticated = middleware(async (_opts) => {
  const user = await supabase.auth.getUser()
  console.log(user)
  if (user.data.user === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return _opts.next({
    ctx: { user: user }
  })
})

const isTeacher = middleware(async (_opts) => {
  const user = await supabase.auth.getUser()
  console.log(user)
  if (user.data.user === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return _opts.next({
    ctx: { user: user }
  })
})
export const publicProcedure = t.procedure;
export const authenticatedProcedure = t.procedure.use(isAuthenticated) 
