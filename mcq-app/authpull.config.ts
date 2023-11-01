import { type Config } from "drizzle-kit";

import { env } from "./src/env.mjs";

export default {
  driver: "pg",
  out: "./src/drizzle/auth",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  tablesFilter: ["users"],
  schemaFilter: ["auth"]
} satisfies Config;

