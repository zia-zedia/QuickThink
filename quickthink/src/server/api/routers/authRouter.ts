import { z } from "zod";
import {
  authenticatedProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import { UserInsert, organizations, users } from "~/drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "~/server/db";

export const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(7).max(24),
});

export const authRouter = createTRPCRouter({
  logout: authenticatedProcedure.mutation(async ({ ctx }) => {
    return await ctx.supabase.auth.signOut();
  }),
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = ctx.supabase;
      const db = ctx.db;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      console.log(data);
      if (!error) {
        const user = await db
          .select()
          .from(users)
          .where(eq(users.authId, data.user.id));
        return { user: user[0], session: data.session };
      }
      throw new TRPCError({
        code: "NOT_FOUND",
        cause: error.cause,
        message: error.message,
      });
    }),
  signUp: publicProcedure
    .input(
      z.object({
        authData: registrationSchema,
        userData: UserInsert.pick({
          userName: true,
          firstName: true,
          lastName: true,
          role: true,
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log(input);
      const supabase = ctx.supabase;
      const db = ctx.db;
      const { data, error } = await supabase.auth.signUp({
        email: input.authData.email,
        password: input.authData.password,
      });
      const usernameExists = await ctx.db
        .select()
        .from(users)
        .where(eq(users.userName, input.userData.userName));

      if (usernameExists.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already used",
        });
      }

      if (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
        });
      }
      if (data.user == null) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      const newUser = await db
        .insert(users)
        .values({
          userName: input.userData.userName,
          firstName: input.userData.firstName,
          lastName: input.userData.lastName,
          role: input.userData.role,
          authId: data.user?.id,
        })
        .returning();

      if (newUser[0]?.role === "teacher") {
        await ctx.db.insert(organizations).values({
          name: `${newUser[0].userName}'s organization`,
          creatorId: newUser[0].id,
        });
      }
      const login = await supabase.auth.signInWithPassword({
        email: input.authData.email,
        password: input.authData.password,
      });
      return { user: newUser[0] };
    }),
  isLoggedIn: publicProcedure.query(async ({ ctx }) => {
    const supabase = ctx.supabase;
    const user = await supabase.auth.getUser();
    console.log(user);
    if (user.data.user != null) {
      const role = await ctx.db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.authId, user.data.user.id));
      return { loggedIn: true, role: role[0]?.role! };
    }
    console.log(user.data.user);
    return { loggedIn: false, role: null };
  }),
});
