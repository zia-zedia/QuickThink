import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { UserInsert, users } from "~/drizzle/schema";
import { eq } from "drizzle-orm";

export const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(7).max(24),
});

export const authRouter = createTRPCRouter({
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
      console.log(data);
      console.log(error);
      if (data.user == null) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const newUser = await db
        .insert(users)
        .values({
          firstName: input.userData.firstName,
          lastName: input.userData.lastName,
          role: input.userData.role,
          authId: data.user?.id,
        })
        .onConflictDoNothing()
        .returning();
      console.log(newUser);
    }),
  isLoggedIn: publicProcedure.query(async ({ ctx }) => {
    const supabase = ctx.supabase;
    const user = await supabase.auth.getUser();
    if (user.data.user != null) {
      console.log(user.data.user);
      return true;
    }
    console.log(user.data.user);
    return false;
  }),
});
