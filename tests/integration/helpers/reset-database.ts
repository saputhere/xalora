import { sql } from "drizzle-orm";
import { db } from "../../../src/shared/db/client";

export async function resetDatabase(): Promise<void> {
  if (process.env.APP_ENV !== "test") {
    throw new Error("Refusing to reset a database outside the test environment.");
  }

  await db.execute(sql`truncate table users, organizations restart identity cascade`);
}