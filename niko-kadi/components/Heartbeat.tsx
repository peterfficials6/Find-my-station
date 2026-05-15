"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const INTERVAL = 15_000; // 15 seconds

export default function Heartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip heartbeat on admin pages
    if (pathname.startsWith("/admin")) return;

    const send = () => {
      fetch("/api/admin/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
      }).catch(() => {});
    };

    send(); // initial
    const id = setInterval(send, INTERVAL);
    return () => clearInterval(id);
  }, [pathname]);

  return null;
}
