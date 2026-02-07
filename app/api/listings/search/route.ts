import { searchFilterSchema } from "@/lib/schemas/listing";
import { searchListings } from "@/lib/server/db";
import { routeErrorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const query = searchFilterSchema.parse(await request.json());
    const listings = searchListings(query);
    return Response.json(listings);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
