"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import ContributionModal from "@/components/ui/ContributionModal";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useGeolocation } from "@/hooks/useGeolocation";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

interface PinDropProps {
  constituencyId: string;
  existingPins?: Array<{ lat: number; lng: number; label?: string }>;
  defaultCenter?: [number, number];
}

export default function PinDrop({
  constituencyId,
  existingPins = [],
  defaultCenter = [-1.2921, 36.8219],
}: PinDropProps) {
  const [selectedPoint, setSelectedPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; error?: boolean } | null>(null);
  const fingerprint = useFingerprint();
  const { latitude, longitude, requestLocation } = useGeolocation();

  const center: [number, number] = latitude && longitude
    ? [latitude, longitude]
    : defaultCenter;

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSelectedPoint({ lat, lng });
    setResult(null);
  }, []);

  const handleSubmit = async (data: {
    display_name: string;
    identity_type: "named" | "nicknamed" | "anonymous";
  }) => {
    if (!selectedPoint || !fingerprint) return;

    setLoading(true);
    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          constituency_id: constituencyId,
          lat: selectedPoint.lat,
          lng: selectedPoint.lng,
          display_name: data.display_name,
          identity_type: data.identity_type,
          device_fingerprint: fingerprint,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setResult({ message: json.message });
        setModalOpen(false);
        setSelectedPoint(null);
      } else {
        setResult({ message: json.error || "Something went wrong", error: true });
      }
    } catch {
      setResult({ message: "Network error. Please try again.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const allMarkers = [
    ...existingPins.map((p) => ({ ...p, verified: false })),
    ...(selectedPoint
      ? [{ lat: selectedPoint.lat, lng: selectedPoint.lng, label: "Your pin", verified: false }]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Know where this office is? Drop a pin!
        </h3>
        <button
          onClick={requestLocation}
          className="text-xs text-green-700 font-medium hover:underline"
        >
          Use my location
        </button>
      </div>

      <MapView
        center={center}
        zoom={14}
        markers={allMarkers}
        onMapClick={handleMapClick}
      />

      {selectedPoint && (
        <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-800">
            Pin placed at {selectedPoint.lat.toFixed(5)}, {selectedPoint.lng.toFixed(5)}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            disabled={!fingerprint}
            className="px-4 py-1.5 text-sm font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      )}

      {result && (
        <p
          className={`text-sm p-3 rounded-lg ${
            result.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {result.message}
        </p>
      )}

      <ContributionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}
