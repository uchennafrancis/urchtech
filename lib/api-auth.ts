import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

type AuthResult =
  | { session: ReturnType<typeof getServerSession> extends Promise<infer T> ? NonNullable<T> : never; userId: string; role: string; error: null }
  | { session: null; userId: null; role: null; error: NextResponse };

export async function requireAuth(requiredRole?: string): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { session: null, userId: null, role: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const userId = (session.user as { id?: string }).id ?? "";
  const role   = (session.user as { role?: string }).role ?? "";

  if (requiredRole && role !== requiredRole && role !== "ADMIN") {
    return { session: null, userId: null, role: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session: session as NonNullable<typeof session>, userId, role, error: null };
}
