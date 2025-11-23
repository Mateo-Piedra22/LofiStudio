export async function ensureSchema(sql: any) {
  await sql`CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY,
    "name" text,
    "email" text NOT NULL,
    "emailVerified" timestamp,
    "image" text
  )`;

  await sql`CREATE TABLE IF NOT EXISTS "account" (
    "userId" text NOT NULL,
    "type" text NOT NULL,
    "provider" text NOT NULL,
    "providerAccountId" text NOT NULL,
    "refresh_token" text,
    "access_token" text,
    "expires_at" integer,
    "token_type" text,
    "scope" text,
    "id_token" text,
    "session_state" text,
    PRIMARY KEY ("provider", "providerAccountId"),
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
  )`;

  await sql`CREATE TABLE IF NOT EXISTS "session" (
    "sessionToken" text PRIMARY KEY,
    "userId" text NOT NULL,
    "expires" timestamp NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
  )`;

  await sql`CREATE TABLE IF NOT EXISTS "verificationToken" (
    "identifier" text NOT NULL,
    "token" text NOT NULL,
    "expires" timestamp NOT NULL,
    PRIMARY KEY ("identifier", "token")
  )`;

  await sql`CREATE TABLE IF NOT EXISTS "task" (
    "id" text PRIMARY KEY,
    "userId" text,
    "title" text NOT NULL,
    "completed" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now(),
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
  )`;

  await sql`CREATE TABLE IF NOT EXISTS "settings" (
    "userId" text PRIMARY KEY,
    "theme" text DEFAULT 'dark',
    "pomodoro_work" integer DEFAULT 25,
    "pomodoro_break" integer DEFAULT 5,
    "preferences" text,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
  )`;

  await sql`CREATE INDEX IF NOT EXISTS account_user_idx ON "account"("userId")`;
  await sql`CREATE INDEX IF NOT EXISTS session_user_idx ON "session"("userId")`;

  await sql`CREATE TABLE IF NOT EXISTS "reviews" (
    "id" text PRIMARY KEY,
    "userId" text NOT NULL,
    "userName" text NOT NULL,
    "userImage" text,
    "rating" integer NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "comment" text,
    "created_at" timestamp DEFAULT now(),
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
  )`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS reviews_user_unique ON "reviews"("userId")`;
}
