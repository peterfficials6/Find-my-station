import { ImageResponse } from "next/og";

export const alt = "Station Details";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { prisma } = await import("@/lib/prisma/client");

  const station = await prisma.constituency.findUnique({
    where: { slug },
    include: { county: true },
  });

  const name = station?.name ?? slug;
  const county = station?.county?.name ?? "";
  const location = station?.officeLocation ?? "";
  const isVerified = station?.verificationStatus === "verified";
  const confirmations = station?.confirmationCount ?? 0;

  const statusText = isVerified
    ? "GPS Verified"
    : confirmations > 0
      ? `${confirmations}/7 Confirmations`
      : "Needs GPS Pin";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%)",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a7f3d0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#a7f3d0" }}>
            findmystation
          </span>
        </div>

        {/* Center */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: "12px",
          }}
        >
          {county ? (
            <div
              style={{
                fontSize: "20px",
                color: "#6ee7b7",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {county} County
            </div>
          ) : null}

          <div
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
              maxWidth: "900px",
            }}
          >
            {name} Constituency
          </div>

          {location ? (
            <div
              style={{
                fontSize: "22px",
                color: "#d1fae5",
                lineHeight: 1.4,
                maxWidth: "700px",
              }}
            >
              {location}
            </div>
          ) : null}
        </div>

        {/* Bottom status */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: isVerified ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.12)",
              borderRadius: "12px",
              padding: "12px 20px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: isVerified ? "#10b981" : "#9ca3af",
              }}
            />
            <span style={{ fontSize: "18px", fontWeight: 600, color: "white" }}>
              {statusText}
            </span>
          </div>

          <div
            style={{
              fontSize: "16px",
              color: "#a7f3d0",
              marginLeft: "auto",
            }}
          >
            IEBC Voter Registration Office
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
