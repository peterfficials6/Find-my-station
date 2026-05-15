import { NextRequest, NextResponse } from "next/server";

// In-memory sliding window rate limiter
const ipRequests = new Map<string, number[]>();
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

const POST_LIMIT = 10; // max POST requests per IP per window
const POST_WINDOW_MS = 60_000; // 1 minute

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_BLOCK_MS = 15 * 60_000; // 15 minutes

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isPostRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequests.get(ip) || [];

  // Remove entries outside the window
  const recent = timestamps.filter((t) => now - t < POST_WINDOW_MS);

  if (recent.length >= POST_LIMIT) {
    ipRequests.set(ip, recent);
    return true;
  }

  recent.push(now);
  ipRequests.set(ip, recent);
  return false;
}

function isLoginBlocked(ip: string): { blocked: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry) return { blocked: false };

  if (entry.blockedUntil > now) {
    return { blocked: true, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) };
  }

  // Reset if block expired
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    loginAttempts.delete(ip);
  }

  return { blocked: false };
}

function recordLoginAttempt(ip: string) {
  const entry = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  entry.count++;

  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    entry.blockedUntil = Date.now() + LOGIN_BLOCK_MS;
  }

  loginAttempts.set(ip, entry);
}

// Clean up old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of ipRequests) {
    const recent = timestamps.filter((t) => now - t < POST_WINDOW_MS);
    if (recent.length === 0) ipRequests.delete(ip);
    else ipRequests.set(ip, recent);
  }
  for (const [ip, entry] of loginAttempts) {
    if (entry.blockedUntil < now && entry.count >= LOGIN_MAX_ATTEMPTS) {
      loginAttempts.delete(ip);
    }
  }
}, 5 * 60_000);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Rate limit admin login
  if (pathname === "/api/admin/login" && method === "POST") {
    const ip = getIP(req);
    const { blocked, retryAfter } = isLoginBlocked(ip);

    if (blocked) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    recordLoginAttempt(ip);
  }

  // Rate limit public POST endpoints
  if (method === "POST" && pathname.startsWith("/api/") && pathname !== "/api/admin/login") {
    const ip = getIP(req);

    if (isPostRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
