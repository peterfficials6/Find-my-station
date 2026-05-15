export const dynamic = "force-dynamic";

import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { prisma } from "@/lib/prisma/client";

export const metadata: Metadata = {
  title: "About | findmystation",
  description:
    "findmystation is a civic project helping Kenyan voters locate IEBC constituency registration offices through crowdsourced GPS coordinates.",
};

async function getStats() {
  try {
    const [total, verified, contributors] = await Promise.all([
      prisma.constituency.count(),
      prisma.constituency.count({ where: { verificationStatus: "verified" } }),
      prisma.contributorIdentity.count(),
    ]);
    return { total, verified, contributors };
  } catch {
    return { total: 290, verified: 0, contributors: 0 };
  }
}

export default async function AboutPage() {
  const stats = await getStats();
  const verifiedPct = stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0;

  return (
    <PageShell title="About">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Helping Kenyans find their voter registration stations
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">
          Kenya has 290 IEBC constituency offices but no public map to find them.
          We&apos;re changing that — one GPS pin at a time.
        </p>
      </div>

      {/* Live progress */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.verified}</p>
          <p className="text-xs text-green-600 mt-0.5">Verified</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.total - stats.verified}</p>
          <p className="text-xs text-amber-600 mt-0.5">Remaining</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.contributors}</p>
          <p className="text-xs text-blue-600 mt-0.5">Contributors</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall verification progress</span>
          <span className="text-sm font-bold text-green-700">{verifiedPct}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-600 rounded-full transition-all"
            style={{ width: `${Math.max(verifiedPct, 1)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          {stats.verified} of {stats.total} stations verified across 47 counties
        </p>
      </div>

      <hr className="border-gray-100 mb-8" />

      {/* The Problem */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">The Problem</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          The IEBC publishes a list of voter registration centres as a PDF with text-based
          directions like &ldquo;Behind Equity Bank, 200 metres from the junction&rdquo; or
          &ldquo;DCC Compound, next to Chief&apos;s Office.&rdquo;
        </p>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <ul className="space-y-2 text-sm text-red-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-400">&times;</span>
              No GPS coordinates for any of the 290 offices
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-400">&times;</span>
              No interactive map — just a static PDF
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-400">&times;</span>
              No way to get directions from your phone
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-red-400">&times;</span>
              Landmarks change or disappear over time
            </li>
          </ul>
        </div>
      </section>

      {/* How We Solve It */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">How We Solve It</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Citizens who know where an IEBC office is drop a GPS pin on the map. When
          7 independent people confirm the same location (within 100 metres), it becomes
          officially verified and anyone can get turn-by-turn directions.
        </p>

        <div className="space-y-3">
          {[
            {
              num: "1",
              title: "Search",
              desc: "Find your constituency by name or browse by county.",
              color: "bg-green-100 text-green-700",
            },
            {
              num: "2",
              title: "Pin",
              desc: "Tap the map to mark where the IEBC office is, or use your GPS.",
              color: "bg-green-100 text-green-700",
            },
            {
              num: "3",
              title: "Verify",
              desc: "7 people confirm the same spot — it's now verified with a green checkmark.",
              color: "bg-green-100 text-green-700",
            },
            {
              num: "4",
              title: "Navigate",
              desc: "Tap to get directions via Google Maps, Waze, Uber, or Apple Maps.",
              color: "bg-green-100 text-green-700",
            },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.color}`}>
                {step.num}
              </div>
              <div className="pt-0.5">
                <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Privacy */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Trust &amp; Privacy</h2>
        <div className="space-y-3">
          {[
            {
              title: "No personal data collected",
              desc: "We don't ask for your email, phone number, or any personal details.",
              icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
            },
            {
              title: "Anonymous by default",
              desc: "You can contribute without sharing your name. We generate a fun alias like \"Happy Flamingo\" for you.",
              icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
            },
            {
              title: "Hashed device fingerprints",
              desc: "We use a one-way hash to prevent duplicate submissions — never stored in a way that identifies you.",
              icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
            },
            {
              title: "Community-verified accuracy",
              desc: "No single person controls the data. 7 independent confirmations ensure reliability.",
              icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Who Built This */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Who Built This</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          findmystation is a civic technology project built by Kenyan developers who believe
          access to democratic infrastructure shouldn&apos;t depend on knowing the right landmark.
          It&apos;s independent, non-partisan, and not affiliated with the IEBC or any political party.
        </p>
      </section>

      {/* CTA */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
        <h3 className="text-base font-bold text-green-900 mb-1">
          Help verify all 290 stations
        </h3>
        <p className="text-sm text-green-700 mb-4">
          Every pin you drop gets us closer. It takes 2 minutes.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 active:bg-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            Start Contributing
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/contribute"
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-green-700 border border-green-200 rounded-xl hover:bg-green-50 active:bg-green-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            How to Help
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
