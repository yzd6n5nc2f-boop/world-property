import { findListingById } from "@/lib/server/db";
import { routeErrorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

type ListingByIdRouteProps = {
  params: { id: string };
};

export async function GET(_request: Request, { params }: ListingByIdRouteProps) {
  try {
    const listing = findListingById(params.id);
    return Response.json(listing);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
