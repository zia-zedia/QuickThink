import { warn } from "console";
import { type Config } from "drizzle-kit";

import { env } from "~/env.mjs";

export default {
  schema: "./src/drizzle/schema.ts",
  driver: "pg",
  out: "./src/drizzle",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
} satisfies Config;
