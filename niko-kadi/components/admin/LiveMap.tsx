"use client";

import { useEffect, useRef, useState } from "react";
import type L from "leaflet";

interface Session {
  id: string;
  lat: number | null;
  lng: number | null;
  country: string | null;
  city: string | null;
  lastSeen: string;
  currentPath: string;
}

interface LiveMapProps {
  sessions: Session[];
}

export default function LiveMap({ sessions }: LiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (leafletRef.current) return;
    (async () => {
      const mod = await import("leaflet");
      leafletRef.current = mod.default ?? mod;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;

    const Leaf = leafletRef.current!;

    const map = Leaf.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    }).setView([0, 20], 2);

    Leaf.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 18, subdomains: "abcd" }
    ).addTo(map);

    Leaf.control.zoom({ position: "topright" }).addTo(map);

    markersRef.current = Leaf.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [ready]);

  useEffect(() => {
    const layer = markersRef.current;
    const Leaf = leafletRef.current;
    if (!layer || !Leaf) return;

    layer.clearLayers();

    const geoSessions = sessions.filter((s) => s.lat != null && s.lng != null);

    geoSessions.forEach((s) => {
      const icon = Leaf.divIcon({
        className: "live-user-marker",
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#4ade80;border:2px solid #166534;box-shadow:0 0 8px rgba(74,222,128,0.6);animation:pulse 2s infinite;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = Leaf.marker([s.lat!, s.lng!], { icon }).addTo(layer);
      marker.bindPopup(
        `<div style="font-size:12px;line-height:1.4;color:#111;">
          <strong>${s.city || "Unknown"}, ${s.country || "Unknown"}</strong><br/>
          <span style="color:#666;">Path: ${s.currentPath}</span><br/>
          <span style="color:#999;">ID: ${s.id.slice(0, 8)}...</span>
        </div>`,
        { className: "live-popup" }
      );
    });

    if (geoSessions.length > 0 && mapRef.current) {
      const bounds = Leaf.latLngBounds(
        geoSessions.map((s) => [s.lat!, s.lng!] as [number, number])
      );
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [sessions]);

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }
      `}</style>
      <div
        ref={containerRef}
        className="h-72 md:h-96"
        aria-label="World map showing live user locations"
      />
    </>
  );
}
