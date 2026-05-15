import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  const allowedFields = [
    "name",
    "officeLocation",
    "landmark",
    "distanceToOffice",
    "verificationStatus",
    "verifiedLat",
    "verifiedLng",
  ];
  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      data[key] = body[key];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.constituency.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Constituency not found" },
      { status: 404 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();

  const {
    verificationStatus,
    verifiedLat,
    verifiedLng,
  } = body;

  if (!verificationStatus) {
    return NextResponse.json(
      { error: "verificationStatus is required" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.constituency.update({
      where: { id },
      data: {
        verificationStatus,
        verifiedLat: verifiedLat ?? null,
        verifiedLng: verifiedLng ?? null,
        verifiedAt:
          verificationStatus === "verified" ? new Date() : null,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Constituency not found" },
      { status: 404 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await prisma.constituency.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Constituency not found" },
      { status: 404 }
    );
  }
}
