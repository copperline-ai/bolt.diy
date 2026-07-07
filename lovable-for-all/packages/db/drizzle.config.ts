import { defineConfig } from "drizzle-kit";
import path from "path";

const cwd = __dirname;

export default defineConfig({
  schema: path.join(cwd, "src/schema/*.ts"),
  out: path.join(cwd, "drizzle"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
