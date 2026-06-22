import { NextResponse, type NextRequest } from "next/server";
import { ne, eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { officers } from "@/lib/db/schema";
import { OFFICER_PASSWORD, SUPERVISOR_CREDENTIALS } from "@/lib/auth-credentials";

export const dynamic = "force-dynamic";

const loginSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("supervisor"),
    email: z.string().email(),
    password: z.string().min(1),
  }),
  z.object({
    role: z.literal("officer"),
    officerId: z.string().min(1),
    password: z.string().min(1),
  }),
]);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.role === "supervisor") {
    const { email, password } = parsed.data;
    if (
      email.toLowerCase() !== SUPERVISOR_CREDENTIALS.email.toLowerCase() ||
      password !== SUPERVISOR_CREDENTIALS.password
    ) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    return NextResponse.json({ role: "supervisor", officerId: null, name: "James Kariuki" });
  }

  const { officerId, password } = parsed.data;
  if (password !== OFFICER_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const [officer] = await db
    .select()
    .from(officers)
    .where(and(eq(officers.id, officerId), ne(officers.status, "Inactive")));

  if (!officer) {
    return NextResponse.json({ error: "Officer not found or inactive" }, { status: 401 });
  }

  return NextResponse.json({ role: "officer", officerId: officer.id, name: officer.name });
}
