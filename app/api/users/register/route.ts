import { z } from "zod";
import { upsertUserAccount } from "@/lib/server/db";
import { routeErrorResponse } from "@/lib/server/http";

export const runtime = "nodejs";

const userRegistrationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120)
});

export async function POST(request: Request) {
  try {
    const body = userRegistrationSchema.parse(await request.json());
    const user = upsertUserAccount({
      email: body.email,
      name: body.name,
      role: "user"
    });

    return Response.json(user, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
