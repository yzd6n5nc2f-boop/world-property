import { z } from "zod";
import { routeErrorResponse } from "@/lib/server/http";
import { upsertUserAccount } from "@/lib/server/db";

export const runtime = "nodejs";

const signInSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  role: z.enum(["user", "agent"]).default("user")
});

export async function POST(request: Request) {
  try {
    const body = signInSchema.parse(await request.json());
    const user = upsertUserAccount({
      email: body.email,
      name: body.name,
      role: body.role
    });

    return Response.json({
      email: user.email,
      name: user.name,
      role: user.role,
      lastLoginAt: user.lastLoginAt
    });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
