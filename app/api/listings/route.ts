import { z } from "zod";
import { routeErrorResponse } from "@/lib/server/http";
import { createListingForUser, listAllListings } from "@/lib/server/db";
import { listingSchema } from "@/lib/schemas/listing";

export const runtime = "nodejs";

const createListingSchema = z.object({
  listing: listingSchema
});

export async function GET() {
  try {
    const listings = listAllListings();
    return Response.json(listings);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createListingSchema.parse(await request.json());
    const userEmail = request.headers.get("x-user-email")?.trim();
    if (!userEmail) {
      return Response.json({ error: "Sign in before publishing a listing." }, { status: 401 });
    }

    const listing = createListingForUser(body.listing, userEmail);
    return Response.json(listing, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
