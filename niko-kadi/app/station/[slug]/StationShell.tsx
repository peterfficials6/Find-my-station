"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import BottomNav from "@/components/layout/BottomNav";
import BottomSheet from "@/components/ui/BottomSheet";
import StatusBadge from "@/components/ui/StatusBadge";
import ContributionModal from "@/components/ui/ContributionModal";
import { useFingerprint } from "@/hooks/useFingerprint";
import { useGeolocation } from "@/hooks/useGeolocation";

const FullScreenMap = dynamic(() => import("@/components/map/FullScreenMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gray-200" aria-hidden />,
});

interface NavigationLinks {
  google_maps: string;
  waze: string;
  apple_maps: string;
  uber: string;
  geo: string;
}

interface StationShellProps {
  station: {
    id: string;
    name: string;
    slug: string;
    county: { name: string; slug: string };
    office_location: string | null;
    landmark: string | null;
    distance_to_office: string | null;
    verification: {
      status: string;
      confirmed_lat: number | null;
      confirmed_lng: number | null;
      confirmation_count: number;
      verified_at: string | null;
    };
    contributions: Array<{
      id: string;
      lat: number;
      lng: number;
      contributor_name: string;
      identity_type: string;
      created_at: string;
    }>;
    navigation?: NavigationLinks;
  };
}

const navOptions = [
  { key: "google_maps" as const, label: "Google Maps", icon: "🗺️" },
  { key: "waze" as const, label: "Waze", icon: "🚗" },
  { key: "apple_maps" as const, label: "Apple Maps", icon: "🍎" },
  { key: "uber" as const, label: "Uber", icon: "🚕" },
  { key: "geo" as const, label: "Default Map", icon: "📍" },
];

export default function StationShell({ station }: StationShellProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pinDropMode, setPinDropMode] = useState(false);
  const [pinPoint, setPinPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [pinAccuracy, setPinAccuracy] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; error?: boolean } | null>(null);
  const fingerprint = useFingerprint();
  const { error: geoError, requestLocation } = useGeolocation();

  const handleMapClick = (lat: number, lng: number) => {
    setPinPoint({ lat, lng });
    setPinAccuracy(null);
    setPinDropMode(false);
  };

  const handleUseGPS = async () => {
    setGpsLoading(true);
    try {
      const coords = await requestLocation();
      setPinPoint({ lat: coords.lat, lng: coords.lng });
      setPinAccuracy(coords.accuracy);
      setPinDropMode(false);
    } catch {
      // error is set in the hook state
    } finally {
      setGpsLoading(false);
    }
  };

  const isVerified = station.verification.status === "verified";
  const hasCoords = !!(station.verification.confirmed_lat && station.verification.confirmed_lng);

  const mapCenter: [number, number] = hasCoords
    ? [station.verification.confirmed_lat!, station.verification.confirmed_lng!]
    : pinPoint
      ? [pinPoint.lat, pinPoint.lng]
      : [-1.2921, 36.8219];

  const mapMarkers = hasCoords
    ? [{
        lat: station.verification.confirmed_lat!,
        lng: station.verification.confirmed_lng!,
        label: station.name,
        slug: station.slug,
        verified: true,
      }]
    : station.contributions.map((c) => ({
        lat: c.lat,
        lng: c.lng,
        label: c.contributor_name,
        slug: station.slug,
        verified: false,
      }));

  const handleSubmit = async (data: {
    display_name: string;
    identity_type: "named" | "nicknamed" | "anonymous";
  }) => {
    if (!pinPoint || !fingerprint) return;
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          constituency_id: station.id,
          lat: pinPoint.lat,
          lng: pinPoint.lng,
          display_name: data.display_name,
          identity_type: data.identity_type,
          device_fingerprint: fingerprint,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setResult({ message: json.message });
        setModalOpen(false);
        setPinPoint(null);
      } else {
        setResult({ message: json.error || "Something went wrong", error: true });
      }
    } catch {
      setResult({ message: "Network error. Please try again.", error: true });
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ── Peek content ── */
  const peekContent = (
    <div>
      {/* Desktop: breadcrumb back */}
      <Link
        href="/"
        className="hidden md:inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-700 mb-3 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All stations
      </Link>
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-bold text-slate-900 truncate">{station.name}</h1>
          <p className="text-xs text-slate-500">{station.county.name} County</p>
        </div>
        <StatusBadge status={station.verification.status} />
      </div>
    </div>
  );

  /* ── Desktop nav ── */
  const panelNav = (
    <nav aria-label="Site navigation" className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-green-700 transition-colors">Search</Link>
        <Link href="/about" className="text-gray-500 hover:text-green-700 transition-colors">About</Link>
        <Link href="/contribute" className="text-gray-500 hover:text-green-700 transition-colors">Help</Link>
      </div>
      <span className="text-xs text-gray-300">findmystation</span>
    </nav>
  );

  return (
    <div className="h-full relative">
      {/* Skip link */}
      <a
        href="#station-details"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-green-700 focus:font-medium"
      >
        Skip to station details
      </a>

      {/* Map — offset on desktop */}
      <div className="absolute inset-0 md:left-[420px] lg:left-[480px]" aria-hidden="true">
        <FullScreenMap
          markers={mapMarkers}
          center={mapCenter}
          zoom={hasCoords ? 16 : 12}
          onMapClick={handleMapClick}
          pinDropMode={pinDropMode}
          droppedPin={pinPoint}
        />
      </div>

      {/* ── Mobile: back button + bottom tab bar ── */}
      <header className="md:hidden fixed top-0 left-0 z-30 pointer-events-none">
        <div
          className="px-4 pb-2"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
        >
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-md text-sm font-medium text-gray-700"
            aria-label="Back to search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>
      </header>

      <BottomNav />

      {/* ── Bottom sheet / side panel ── */}
      <BottomSheet defaultSnap="half" peekContent={peekContent} navLinks={panelNav}>
        <main id="station-details">
          {/* Office details */}
          <section aria-label="Office details" className="mb-4">
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              {station.office_location && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Office Location</p>
                    <p className="text-sm text-slate-900">{station.office_location}</p>
                  </div>
                </div>
              )}

              {station.landmark && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Landmark</p>
                    <p className="text-sm text-slate-900">{station.landmark}</p>
                  </div>
                </div>
              )}

              {station.distance_to_office && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">Distance</p>
                    <p className="text-sm text-slate-900">{station.distance_to_office}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Verification progress */}
          {!isVerified && (
            <section aria-label="Verification progress" className="mb-4">
              <div className="bg-emerald-50 rounded-xl p-4" role="progressbar" aria-valuenow={station.verification.confirmation_count} aria-valuemin={0} aria-valuemax={7}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-900">
                    {station.verification.confirmation_count === 0
                      ? "GPS not yet verified"
                      : `${station.verification.confirmation_count} of 7 confirmations`}
                  </span>
                  <span className="text-xs font-medium text-emerald-600">{station.verification.confirmation_count}/7</span>
                </div>
                <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(Math.min((station.verification.confirmation_count / 7) * 100, 100), 2)}%` }}
                  />
                </div>
                <p className="text-xs text-emerald-700 mt-2">
                  {station.verification.confirmation_count === 0
                    ? "Be the first to pin this location on the map"
                    : `${7 - station.verification.confirmation_count} more ${7 - station.verification.confirmation_count === 1 ? "person" : "people"} needed to verify`}
                </p>
              </div>
            </section>
          )}

          {/* Navigation buttons (verified) */}
          {isVerified && hasCoords && station.navigation && (
            <section aria-label="Navigation options" className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Get Directions</h2>
              <div className="grid grid-cols-3 gap-2">
                {navOptions.slice(0, 3).map((opt) => (
                  <a
                    key={opt.key}
                    href={station.navigation![opt.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 active:bg-emerald-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={`Navigate with ${opt.label}`}
                  >
                    <span className="text-xl" aria-hidden="true">{opt.icon}</span>
                    <span className="text-xs font-medium text-slate-600">{opt.label}</span>
                  </a>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {navOptions.slice(3).map((opt) => (
                  <a
                    key={opt.key}
                    href={station.navigation![opt.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 active:bg-emerald-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    aria-label={`Navigate with ${opt.label}`}
                  >
                    <span className="text-lg" aria-hidden="true">{opt.icon}</span>
                    <span className="text-xs font-medium text-slate-600">{opt.label}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Pin drop CTA (unverified) */}
          {!isVerified && (
            <section aria-label="Contribute location" className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">Help verify this location</h2>

              {pinDropMode ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center" role="status">
                  <p className="text-sm font-medium text-amber-800">Tap on the map to drop your pin</p>
                  <p className="text-xs text-amber-600 mt-0.5">Tap the exact location of the office</p>
                  <button
                    onClick={() => setPinDropMode(false)}
                    className="mt-2 text-xs text-amber-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : pinPoint ? (
                <div className="space-y-2">
                  <div className="bg-green-50 border border-green-200 p-3 rounded-xl" role="status">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Pin dropped</p>
                        <p className="text-xs text-green-600">{pinPoint.lat.toFixed(5)}, {pinPoint.lng.toFixed(5)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setPinPoint(null); setPinAccuracy(null); setPinDropMode(true); }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                        >
                          Redo
                        </button>
                        <button
                          onClick={() => setModalOpen(true)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                    {pinAccuracy !== null && (
                      <p className="text-xs text-green-600 mt-1.5">
                        GPS accuracy: ~{Math.round(pinAccuracy)}m
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Primary: I'm here (GPS) */}
                  <button
                    onClick={handleUseGPS}
                    disabled={gpsLoading}
                    className="w-full py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 active:bg-green-800 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:opacity-60"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a1 1 0 011 1v2.07A8.003 8.003 0 0118.93 11H21a1 1 0 110 2h-2.07A8.003 8.003 0 0113 18.93V21a1 1 0 11-2 0v-2.07A8.003 8.003 0 015.07 13H3a1 1 0 110-2h2.07A8.003 8.003 0 0111 5.07V3a1 1 0 011-1zm0 6a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                    {gpsLoading ? "Getting location..." : "I\u2019m at this office"}
                  </button>

                  {/* Secondary: Tap map */}
                  <button
                    onClick={() => setPinDropMode(true)}
                    className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 active:bg-gray-50 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    I know where it is (tap map)
                  </button>

                  {geoError && (
                    <p className="text-xs text-red-600 text-center">{geoError}</p>
                  )}
                </div>
              )}

              {result && (
                <p
                  role="alert"
                  className={`text-sm p-3 rounded-xl mt-2 ${result.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
                >
                  {result.message}
                </p>
              )}
            </section>
          )}

          {/* Contributors */}
          {station.contributions.length > 0 && (
            <section aria-label="Contributors" className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Contributors
              </h2>
              <div className="bg-slate-50 rounded-xl overflow-hidden">
                {station.contributions.map((c, i) => (
                  <div
                    key={c.id}
                    className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-slate-100" : ""}`}
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-emerald-600">
                        {c.contributor_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">{c.contributor_name}</p>
                    </div>
                    <time className="text-xs text-slate-400 flex-shrink-0" dateTime={c.created_at}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </time>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Spacer for mobile tab bar */}
          <div className="h-16 md:h-4" />
        </main>

        <ContributionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          loading={submitLoading}
        />
      </BottomSheet>
    </div>
  );
}
