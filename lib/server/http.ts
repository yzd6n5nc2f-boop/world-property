import { ZodError } from "zod";
import { ApiError } from "@/lib/server/db";

export function routeErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Invalid request payload.",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      },
      { status: 400 }
    );
  }

  console.error(error);
  return Response.json({ error: "Internal server error." }, { status: 500 });
}
