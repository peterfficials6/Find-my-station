import { NextResponse } from "next/server";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const constituencies = await prisma.constituency.findMany({
    include: {
      county: { select: { id: true, name: true, slug: true } },
      _count: {
        select: {
          contributions: true,
          flags: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(constituencies);
}
