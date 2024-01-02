import { number, z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  authenticatedProcedure,
  teacherProcedure,
} from "../trpc";
import {
  ZodTest,
  organizations,
  tests,
  user_org,
  users,
} from "~/drizzle/schema";
import { and, eq, isNull, not } from "drizzle-orm";
import test from "node:test";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { contextProps } from "@trpc/react-query/shared";

export const organizationRouter = createTRPCRouter({
  deleteOrganization: publicProcedure
    .input(z.object({ organization_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(organizations)
        .where(eq(organizations.id, input.organization_id));
    }),
  getOrganizations: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(organizations);
  }),
  updateOrganizationData: publicProcedure
    .input(
      z.object({
        organization_id: z.string().uuid(),
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(organizations)
        .set({ name: input.name })
        .where(eq(organizations.id, input.organization_id));
    }),
  addOrganization: publicProcedure.mutation(async ({ ctx }) => {
    return await ctx.db
      .insert(organizations)
      .values({ name: "New Organization" });
  }),
  removeTestFromOrganization: publicProcedure
    .input(z.object({ test_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(tests)
        .set({ organizationId: null })
        .where(eq(tests.id, input.test_id));
    }),
  addTestsToOrganization: publicProcedure
    .input(
      z.object({ organization_id: z.string().uuid(), tests: z.array(ZodTest) }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedTests = input.tests.map(async (test) => {
        await ctx.db
          .update(tests)
          .set({ organizationId: input.organization_id })
          .where(and(eq(tests.id, test.id), isNull(tests.organizationId)))
          .returning();
      });
      const update = await Promise.all(updatedTests).then(() => {
        return updatedTests;
      });
      return update;
    }),
  getTests: publicProcedure.query(async ({ ctx, input }) => {
    return await ctx.db.select().from(tests);
  }),
  getTeacherTest: teacherProcedure.query(async ({ ctx, input }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return await ctx.db
      .select()
      .from(tests)
      .where(eq(tests.teacherId, ctx.user?.id!));
  }),
  getOrganizationTests: publicProcedure
    .input(z.object({ organization_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(tests)
        .where(eq(tests.organizationId, input.organization_id));
    }),
  removeParticipant: publicProcedure
    .input(
      z.object({
        organization_id: z.string().uuid(),
        user_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .delete(user_org)
        .where(
          and(
            eq(user_org.organizationId, input.organization_id),
            eq(user_org.userId, input.user_id),
          ),
        );
    }),
  getParticipants: publicProcedure
    .input(z.object({ organization_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(user_org)
        .leftJoin(users, eq(user_org.userId, users.id))
        .leftJoin(organizations, eq(user_org.organizationId, organizations.id))
        .where(
          and(
            eq(organizations.id, input.organization_id),
            eq(users.role, "student"),
          ),
        );
    }),
  addParticipant: publicProcedure
    .input(
      z.object({
        username: z.string().min(5).max(15),
        organization_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db
        .select()
        .from(users)
        .leftJoin(user_org, eq(user_org.userId, users.id))
        .where(eq(users.userName, input.username));

      if (user.length === 0 || !user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Didn't find a user with that username",
        });
      }

      if (
        user.filter(
          (data) =>
            data.user_organization?.organizationId === input.organization_id,
        ).length >= 1
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already added.",
        });
      }

      return await ctx.db
        .insert(user_org)
        .values({
          userId: user[0]!.users?.id!,
          organizationId: input.organization_id,
        })
        .returning();
    }),
});
