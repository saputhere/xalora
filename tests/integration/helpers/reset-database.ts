import { sql } from "drizzle-orm";
import { db } from "../../../src/shared/db/client";

export async function resetDatabase(): Promise<void> {
  if (process.env.APP_ENV !== "test") {
    throw new Error("Refusing to reset a database outside the test environment.");
  }

  // Sessions are listed explicitly so the reset stays correct if the schema changes.
  await db.execute(sql`truncate table sessions, users, organizations restart identity cascade`);
}