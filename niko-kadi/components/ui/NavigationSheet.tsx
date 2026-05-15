"use client";

import { useState } from "react";

interface NavigationLinks {
  google_maps: string;
  waze: string;
  apple_maps: string;
  uber: string;
  geo: string;
}

interface NavigationSheetProps {
  links: NavigationLinks;
  stationName: string;
}

const navOptions = [
  { key: "google_maps", label: "Google Maps", icon: "🗺️" },
  { key: "waze", label: "Waze", icon: "🚗" },
  { key: "apple_maps", label: "Apple Maps", icon: "🍎" },
  { key: "uber", label: "Uber", icon: "🚕" },
  { key: "geo", label: "Default Map App", icon: "📍" },
] as const;

export default function NavigationSheet({ links, stationName }: NavigationSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full h-12 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Navigate
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div className="relative w-full max-w-lg bg-white rounded-t-2xl p-6 pb-8 safe-area-bottom animate-slide-up">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Navigate to {stationName}
            </h3>
            <p className="text-sm text-gray-500 mb-4">Choose your preferred navigation app</p>
            <div className="flex flex-col gap-2">
              {navOptions.map((opt) => (
                <a
                  key={opt.key}
                  href={links[opt.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="font-medium text-gray-900">{opt.label}</span>
                </a>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-4 h-10 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
