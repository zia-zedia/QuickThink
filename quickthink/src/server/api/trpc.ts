import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "~/server/db";
import { supabase, user, session } from "../auth/auth";
import { testSessions } from "../timer/timer";
import { users } from "~/drizzle/schema";
import { eq } from "drizzle-orm";

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
  const authUser = await supabase.auth.getUser();
  console.log(authUser);
  if (authUser.data.user === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const user = await db
    .select()
    .from(users)
    .where(eq(users.authId, authUser.data.user?.id));

  return _opts.next({
    ctx: { user: user },
  });
});

const isTeacher = middleware(async (_opts) => {
<<<<<<< HEAD
<<<<<<< HEAD
  const authId = _opts.ctx.user?.data?.user?.id!
  const db = _opts.ctx.db;
  const userRole = await db.select({role : users.role}).from(users).where(eq(users.authId, authId));
=======
<<<<<<< HEAD
=======
>>>>>>> 1979f40cb044bc7a5d79fbf382808fa19b9fd288
  const db = _opts.ctx.db;
  const authUser = await supabase.auth.getUser();
  console.log(authUser);
  if (authUser.data.user === null) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.authId, authUser.data.user?.id));

  if (user.length === 0) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

<<<<<<< HEAD
  return _opts.next({
    ctx: { user: user },
  });
=======
  const authId = _opts.ctx.user?.data?.user?.id?
  const userRole = await _opts.ctx.db;
    .select({ role: users.role })
    .from(users)
    .where(eq(users.authId, authId));
>>>>>>> beb9d76fa4c9698c6704eb643a05b4dedcde9acf

  if (userRole.length === 0) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  if (!(userRole[0]?.role === "teacher")) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
=======
>>>>>>> 1979f40cb044bc7a5d79fbf382808fa19b9fd288
  return _opts.next();
});
export const publicProcedure = t.procedure;
export const authenticatedProcedure = t.procedure.use(isAuthenticated);
export const teacherProcedure = t.procedure.use(isTeacher);
