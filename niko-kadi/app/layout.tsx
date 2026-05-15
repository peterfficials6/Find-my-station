import type { Metadata, Viewport } from "next";
import Heartbeat from "@/components/Heartbeat";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "findmystation - Find Your IEBC Voter Registration Office",
    template: "%s | findmystation",
  },
  description:
    "Find the nearest IEBC voter registration office in Kenya. Crowdsourced GPS locations for all 290 constituency offices.",
  keywords: [
    "IEBC",
    "voter registration",
    "Kenya",
    "constituency office",
    "find station",
    "voter registration office",
  ],
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "findmystation",
    title: "findmystation - Find Your IEBC Voter Registration Office",
    description:
      "Crowdsourced GPS locations for all 290 IEBC constituency offices in Kenya.",
  },
  twitter: {
    card: "summary_large_image",
    title: "findmystation - Find Your IEBC Voter Registration Office",
    description:
      "Crowdsourced GPS locations for all 290 IEBC constituency offices in Kenya.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full overflow-hidden bg-gray-100">
        {children}
        <Heartbeat />
      </body>
    </html>
  );
}
