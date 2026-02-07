import { getDatabasePath } from "@/lib/server/db";
import { routeErrorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    return Response.json({
      status: "ok",
      databasePath: getDatabasePath(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
