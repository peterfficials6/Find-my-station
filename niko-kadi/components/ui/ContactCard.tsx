"use client";

import { useState } from "react";
import SuggestFeatureDrawer from "./SuggestFeatureDrawer";

export default function ContactCard() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
        {/* Contact info */}
        <div className="p-5">
          <h3 className="text-base font-bold text-gray-900 mb-1">Get in Touch</h3>
          <p className="text-sm text-gray-600 mb-4">
            Have a question, want to partner, or just want to say hello? Reach out directly.
          </p>

          <div className="space-y-3">
            {/* Phone */}
            <a
              href="tel:+254711175616"
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-green-200 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">0711 175 616</p>
                <p className="text-xs text-gray-500">Call or WhatsApp</p>
              </div>
            </a>

            {/* M-Pesa */}
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">M-Pesa: 0711 175 616</p>
                <p className="text-xs text-gray-500">
                  Send to this number to support hosting, domain, and outreach costs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggest a Feature */}
        <div className="border-t border-gray-200 p-5 bg-white">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Have an idea?</h3>
          <p className="text-sm text-gray-500 mb-3">
            Suggest a feature, share design assets, or propose improvements of any kind.
          </p>
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full py-2.5 text-sm font-semibold text-green-700 border border-green-200 rounded-xl hover:bg-green-50 active:bg-green-50 transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Suggest a Feature
          </button>
        </div>
      </div>

      <SuggestFeatureDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
