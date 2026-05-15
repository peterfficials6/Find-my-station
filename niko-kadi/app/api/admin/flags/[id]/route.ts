import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await prisma.flag.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Flag not found" }, { status: 404 });
  }
}
