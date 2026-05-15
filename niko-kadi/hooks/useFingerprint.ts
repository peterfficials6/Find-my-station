"use client";

import { useState, useEffect } from "react";

async function generateFingerprint(): Promise<string> {
  const components = [
    screen.width.toString(),
    screen.height.toString(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.userAgent,
    screen.colorDepth.toString(),
    new Date().getTimezoneOffset().toString(),
  ];

  const raw = components.join("|");
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function useFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    generateFingerprint().then(setFingerprint);
  }, []);

  return fingerprint;
}
