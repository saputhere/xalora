import { config } from "dotenv";

config({ path: ".env.test.local" });

if (process.env.APP_ENV !== "test") {
  throw new Error("Integration tests must run with APP_ENV=test. Check .env.test.local.");
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is not set in .env.test.local.");
}

// The app's database client reads DATABASE_URL, so point it at the test branch.
// Setup files run before test files, so the client is created with this value.
process.env.DATABASE_URL = testDatabaseUrl;