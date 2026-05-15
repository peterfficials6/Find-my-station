"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type L from "leaflet";

interface Marker {
  lat: number;
  lng: number;
  label: string;
  slug: string;
  verified: boolean;
}

interface FullScreenMapProps {
  markers?: Marker[];
  onMarkerClick?: (slug: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  pinDropMode?: boolean;
  droppedPin?: { lat: number; lng: number } | null;
  center?: [number, number];
  zoom?: number;
}

const KENYA_CENTER: [number, number] = [-0.0236, 37.9062];
const KENYA_ZOOM = 7;

export default function FullScreenMap({
  markers = [],
  onMarkerClick,
  onMapClick,
  pinDropMode = false,
  droppedPin,
  center = KENYA_CENTER,
  zoom = KENYA_ZOOM,
}: FullScreenMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const droppedPinRef = useRef<L.Marker | null>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const [ready, setReady] = useState(false);

  // Load leaflet dynamically
  useEffect(() => {
    if (leafletRef.current) return;

    (async () => {
      const mod = await import("leaflet");
      leafletRef.current = mod.default ?? mod;
      setReady(true);
    })();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;

    const Leaf = leafletRef.current!;

    const map = Leaf.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView(center, zoom);

    Leaf.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    Leaf.control.zoom({ position: "topright" }).addTo(map);

    Leaf.control.attribution({ position: "bottomleft", prefix: false })
      .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>')
      .addTo(map);

    markersLayerRef.current = Leaf.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Update markers
  const updateMarkers = useCallback(() => {
    const layer = markersLayerRef.current;
    const Leaf = leafletRef.current;
    if (!layer || !Leaf) return;

    layer.clearLayers();

    markers.forEach((m) => {
      const color = m.verified ? "#16a34a" : "#d97706";
      const icon = Leaf.divIcon({
        className: "custom-marker",
        html: `<div style="width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);background:${color};display:flex;align-items:center;justify-content:center;">
          ${m.verified ? '<svg width="14" height="14" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>' : '<div style="width:8px;height:8px;border-radius:50%;background:white;"></div>'}
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = Leaf.marker([m.lat, m.lng], { icon }).addTo(layer);
      marker.on("click", () => {
        onMarkerClick?.(m.slug);
      });
    });
  }, [markers, onMarkerClick]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Handle map click for pin dropping
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!pinDropMode || !onMapClick) return;

    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    map.getContainer().style.cursor = "crosshair";

    return () => {
      map.off("click", handler);
      map.getContainer().style.cursor = "";
    };
  }, [pinDropMode, onMapClick]);

  // Render dropped pin
  useEffect(() => {
    const map = mapRef.current;
    const Leaf = leafletRef.current;
    if (!map || !Leaf) return;

    if (droppedPinRef.current) {
      map.removeLayer(droppedPinRef.current);
      droppedPinRef.current = null;
    }

    if (!droppedPin) return;

    const icon = Leaf.divIcon({
      className: "dropped-pin",
      html: `<div style="width:36px;height:36px;border-radius:50%;border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.4);background:#dc2626;display:flex;align-items:center;justify-content:center;animation:bounce 0.3s ease-out;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    droppedPinRef.current = Leaf.marker([droppedPin.lat, droppedPin.lng], { icon }).addTo(map);
  }, [droppedPin]);

  // Fly to center when it changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo(center, zoom, { duration: 0.8 });
    }
  }, [center, zoom]);

  // Invalidate size when container resizes
  useEffect(() => {
    const container = containerRef.current;
    const map = mapRef.current;
    if (!container || !map) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ zIndex: 0 }}
    />
  );
}
