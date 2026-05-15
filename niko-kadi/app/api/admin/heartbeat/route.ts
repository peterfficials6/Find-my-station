import { NextRequest, NextResponse } from "next/server";
import { upsertSession, getActiveSessions } from "@/lib/admin/heartbeat";
import { geolocateIP } from "@/lib/admin/geo";
import { verifySession } from "@/lib/admin/session";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const path = body.path || "/";

  // Get or create session ID from cookie
  let sessionId = request.cookies.get("_fms_sid")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  // Get IP for geolocation
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const geo = await geolocateIP(ip);

  upsertSession({
    id: sessionId,
    lat: geo?.lat ?? null,
    lng: geo?.lng ?? null,
    country: geo?.country ?? null,
    city: geo?.city ?? null,
    lastSeen: new Date(),
    currentPath: path,
  });

  const res = NextResponse.json({ ok: true });
  if (!request.cookies.get("_fms_sid")) {
    res.cookies.set("_fms_sid", sessionId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  return res;
}

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = getActiveSessions();
  return NextResponse.json({
    count: sessions.length,
    sessions,
  });
}
