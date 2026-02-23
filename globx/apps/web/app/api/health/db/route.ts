import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "@repo/db";

/** GET /api/health/db - Check if the app can connect to PostgreSQL. */
export async function GET() {
  const result = await checkDatabaseConnection();
  if (result.ok) {
    return NextResponse.json({ status: "ok", database: "connected" });
  }
  return NextResponse.json(
    { status: "error", database: "disconnected", error: result.error },
    { status: 503 }
  );
}
