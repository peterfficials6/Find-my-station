"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import BottomNav from "@/components/layout/BottomNav";
import BottomSheet, { type SnapPoint } from "@/components/ui/BottomSheet";
import StationCard from "@/components/ui/StationCard";

const FullScreenMap = dynamic(() => import("@/components/map/FullScreenMap"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gray-200" aria-hidden />,
});

interface LocationItem {
  slug: string;
  name: string;
  type?: "office" | "centre";
  ward?: string | null;
  constituency?: string;
  constituency_slug?: string;
  county: string;
  county_slug: string;
  office_location: string | null;
  status: string;
  confirmations: number;
  has_coordinates: boolean;
  active_until?: string | null;
  is_active?: boolean;
}

interface HomeShellProps {
  initialData: LocationItem[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  initialSearch?: string;
}

export default function HomeShell({
  initialData,
  initialPagination,
  initialSearch = "",
}: HomeShellProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialSearch);
  const [results, setResults] = useState(initialData);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [sheetSnap, setSheetSnap] = useState<SnapPoint>("half");
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeEmpty, setNearMeEmpty] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(
    async (search: string, page = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (page > 1) params.set("page", String(page));

      try {
        const res = await fetch(`/api/locations?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data);
          setPagination(json.pagination);
        }
      } catch {
        // keep current results
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, fetchResults]);

  const handleNearMe = async () => {
    if (!navigator.geolocation) return;
    setNearMeLoading(true);
    setNearMeEmpty(false);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const params = new URLSearchParams();
      params.set("lat", pos.coords.latitude.toFixed(6));
      params.set("lng", pos.coords.longitude.toFixed(6));
      const res = await fetch(`/api/locations?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        // Check if any results have verified GPS coordinates
        const hasNearby = json.data.some((r: LocationItem) => r.has_coordinates);
        if (hasNearby) {
          setResults(json.data);
          setPagination(json.pagination);
          setQuery("");
        } else {
          // No GPS-verified locations — show contribution prompt
          setNearMeEmpty(true);
        }
        if (sheetSnap === "peek") setSheetSnap("half");
      }
    } catch {
      // silently fail — user denied or timeout
    } finally {
      setNearMeLoading(false);
    }
  };

  const handleMarkerClick = useCallback(
    (slug: string) => {
      // Check if it's a centre or office by looking at results
      const item = results.find((r) => r.slug === slug);
      if (item?.type === "centre") {
        router.push(`/centre/${slug}`);
      } else {
        router.push(`/station/${slug}`);
      }
    },
    [router, results]
  );

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchResults(query, pagination.page + 1);
    }
  };

  /* ── Peek content (search bar — visible in all sheet states) ── */
  const peekContent = (
    <div>
      {/* Desktop branding + nav */}
      <div className="hidden md:flex items-center justify-between mb-3">
        <Link href="/" className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-base font-bold text-green-700">findmystation</span>
        </Link>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="search-input" className="sr-only">Search locations</label>
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="search-input"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (sheetSnap === "peek") setSheetSnap("half");
            }}
            onFocus={() => {
              if (sheetSnap === "peek") setSheetSnap("half");
            }}
            placeholder="Search by name, ward, or location..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus:bg-white border-0"
          />
        </div>
        <button
          onClick={handleNearMe}
          disabled={nearMeLoading}
          className="flex-shrink-0 h-10 px-3 rounded-xl bg-emerald-600 text-white flex items-center gap-1.5 hover:bg-emerald-700 active:bg-emerald-700 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          aria-label="Find near me"
        >
          {nearMeLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a1 1 0 011 1v2.07A8.003 8.003 0 0118.93 11H21a1 1 0 110 2h-2.07A8.003 8.003 0 0113 18.93V21a1 1 0 11-2 0v-2.07A8.003 8.003 0 015.07 13H3a1 1 0 110-2h2.07A8.003 8.003 0 0111 5.07V3a1 1 0 011-1z" />
            </svg>
          )}
          <span className="text-xs font-medium whitespace-nowrap">Near me</span>
        </button>
      </div>
    </div>
  );

  /* ── Desktop nav links (bottom of side panel) ── */
  const navLinks = (
    <nav aria-label="Site navigation" className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <Link href="/about" className="text-gray-500 hover:text-green-700 transition-colors">
          About
        </Link>
        <Link href="/contribute" className="text-gray-500 hover:text-green-700 transition-colors">
          How to Help
        </Link>
      </div>
      <span className="text-xs text-gray-300">findmystation</span>
    </nav>
  );

  return (
    <div className="h-full relative">
      {/* Skip to content */}
      <a
        href="#station-list"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-green-700 focus:font-medium"
      >
        Skip to station list
      </a>

      {/* Map — offset left on desktop for side panel */}
      <div className="absolute inset-0 md:left-[420px] lg:left-[480px]" aria-hidden="true">
        <FullScreenMap onMarkerClick={handleMarkerClick} />
      </div>

      {/* ── Mobile floating header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div
          className="flex items-center justify-between px-4 pb-2"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
        >
          <Link
            href="/"
            className="pointer-events-auto bg-white/90 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-md flex items-center gap-2"
            aria-label="findmystation home"
          >
            <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-bold text-green-700">findmystation</span>
          </Link>
        </div>
      </header>

      <BottomNav />

      {/* ── Bottom sheet (mobile) / Side panel (desktop) ── */}
      <BottomSheet
        defaultSnap="half"
        peekContent={peekContent}
        navLinks={navLinks}
        onSnapChange={setSheetSnap}
      >
        <main id="station-list">
          {/* Results count */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500" aria-live="polite">
              {loading ? "Searching..." : `${pagination.total} locations`}
            </p>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-green-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 rounded px-1"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results list */}
          <div className="space-y-3" role="list" aria-label="Stations">
            {results.length === 0 ? (
              <div className="text-center py-8 text-gray-400" role="status">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm font-medium">No locations found</p>
                <p className="text-xs mt-0.5">Try a different search</p>
              </div>
            ) : (
              results.map((station) => (
                <div key={station.slug} role="listitem">
                  <StationCard {...station} />
                </div>
              ))
            )}
          </div>

          {/* Load more */}
          {pagination.page < pagination.pages && (
            <button
              onClick={handleLoadMore}
              className="w-full mt-3 py-2.5 text-sm font-medium text-green-700 bg-green-50 rounded-xl hover:bg-green-100 active:bg-green-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
            >
              Load more ({pagination.total - results.length} remaining)
            </button>
          )}

          {/* Spacer for mobile tab bar */}
          <div className="h-16 md:h-4" />
        </main>

        {/* Near me — no verified locations modal */}
        {nearMeEmpty && (
          <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setNearMeEmpty(false)}
          >
            <div
              className="w-full max-w-sm mx-4 mb-4 md:mb-0 bg-white rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center">
                No verified locations near you yet
              </h3>
              <p className="text-sm text-slate-500 text-center mt-2">
                GPS pins haven&apos;t been verified in your area. You can help by searching for a nearby station and dropping a pin on its location.
              </p>
              <div className="mt-5 space-y-2">
                <button
                  onClick={() => {
                    setNearMeEmpty(false);
                    const input = document.getElementById("search-input");
                    input?.focus();
                  }}
                  className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:bg-emerald-700 transition-colors"
                >
                  Search for a station
                </button>
                <button
                  onClick={() => setNearMeEmpty(false)}
                  className="w-full py-3 text-slate-500 font-medium rounded-xl hover:bg-slate-50 active:bg-slate-50 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
