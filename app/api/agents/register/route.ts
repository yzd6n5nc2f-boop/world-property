import { z } from "zod";
import { routeErrorResponse } from "@/lib/server/http";
import { upsertAgentAccount } from "@/lib/server/db";

export const runtime = "nodejs";

const agentRegistrationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120),
  company: z.string().min(2).max(160).optional(),
  phone: z.string().min(6).max(40).optional(),
  licenseNumber: z.string().max(80).optional(),
  bio: z.string().max(1200).optional()
});

export async function POST(request: Request) {
  try {
    const body = agentRegistrationSchema.parse(await request.json());
    const result = upsertAgentAccount(body);
    return Response.json(result, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
