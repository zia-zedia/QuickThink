import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { UserInsert, organization, users } from "~/drizzle/schema";
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
      console.log(data);
      console.log(error);
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
        .onConflictDoNothing()
        .returning();

      if (newUser[0]?.role === "teacher") {
        await ctx.db
          .insert(organization)
          .values({
            name: `${newUser[0].userName}'s organization`,
            creatorId: newUser[0].id,
          });
      }

      return { user: newUser[0] };
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
