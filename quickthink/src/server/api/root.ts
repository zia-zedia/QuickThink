import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { testRouter } from "./routers/testRouter";
import { dashboardRouter } from "./routers/dashboard";
import { authRouter } from "./routers/authRouter";
import { studentRouter } from "./routers/studentRouter";
import { teacherRouter } from "./routers/teacherRouter";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  tests: testRouter,
  dashboard: dashboardRouter,
  auth: authRouter,
  student: studentRouter,
  teacher: teacherRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
