import { z } from "zod";
import { searchFilterSchema } from "@/lib/schemas/listing";
import { listSavedSearches, resolvePrincipalFromHeaders, saveSearchForPrincipal } from "@/lib/server/db";
import { routeErrorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

const saveSearchSchema = z.object({
  query: searchFilterSchema
});

export async function GET(request: Request) {
  try {
    const principal = resolvePrincipalFromHeaders(request.headers);
    const queries = listSavedSearches(principal);
    return Response.json(queries);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = saveSearchSchema.parse(await request.json());
    const principal = resolvePrincipalFromHeaders(request.headers);
    const queries = saveSearchForPrincipal(principal, body.query);
    return Response.json(queries, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
