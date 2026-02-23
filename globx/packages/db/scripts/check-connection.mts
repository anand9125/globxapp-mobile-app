/**
 * Verify PostgreSQL connection using DATABASE_URL from packages/db/.env
 * Run from repo root: pnpm exec tsx packages/db/scripts/check-connection.mts
 * Or from packages/db: pnpm exec tsx scripts/check-connection.mts (with DOTENV_CONFIG_PATH=.env)
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load .env from packages/db so DATABASE_URL is set before importing prisma
config({ path: resolve(__dirname, "../.env") });

const { checkDatabaseConnection } = await import("../src/client.ts");

const result = await checkDatabaseConnection();
if (result.ok) {
  console.log("OK – connected to PostgreSQL");
  process.exit(0);
} else {
  console.error("FAIL –", result.error);
  process.exit(1);
}
