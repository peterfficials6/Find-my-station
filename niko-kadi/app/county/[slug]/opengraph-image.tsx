import { ImageResponse } from "next/og";

export const alt = "County Details";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { prisma } = await import("@/lib/prisma/client");

  const county = await prisma.county.findUnique({
    where: { slug },
    include: {
      constituencies: {
        select: { verificationStatus: true },
      },
    },
  });

  const name = county?.name ?? slug;
  const total = county?.constituencies?.length ?? 0;
  const verified = county?.constituencies?.filter(
    (c: { verificationStatus: string }) => c.verificationStatus === "verified"
  ).length ?? 0;

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
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              color: "#6ee7b7",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            County
          </div>
          <div
            style={{
              fontSize: "60px",
              fontWeight: 800,
              color: "white",
              lineHeight: 1.15,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#d1fae5",
            }}
          >
            {total} IEBC voter registration offices
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255,255,255,0.12)",
              borderRadius: "12px",
              padding: "12px 20px",
            }}
          >
            <span style={{ fontSize: "22px", fontWeight: 700, color: "white" }}>{total}</span>
            <span style={{ fontSize: "16px", color: "#d1fae5" }}>Constituencies</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: verified > 0 ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.12)",
              borderRadius: "12px",
              padding: "12px 20px",
            }}
          >
            <span style={{ fontSize: "22px", fontWeight: 700, color: "white" }}>{verified}</span>
            <span style={{ fontSize: "16px", color: "#d1fae5" }}>GPS Verified</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
