import { z } from "zod";
import { listSavedListingIds, resolvePrincipalFromHeaders, toggleSavedListingForPrincipal } from "@/lib/server/db";
import { routeErrorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

const toggleSchema = z.object({
  listingId: z.string().min(1)
});

export async function GET(request: Request) {
  try {
    const principal = resolvePrincipalFromHeaders(request.headers);
    const ids = listSavedListingIds(principal);
    return Response.json(ids);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = toggleSchema.parse(await request.json());
    const principal = resolvePrincipalFromHeaders(request.headers);
    const ids = toggleSavedListingForPrincipal(principal, body.listingId);
    return Response.json(ids);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
