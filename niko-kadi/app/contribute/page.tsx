import { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import ContactCard from "@/components/ui/ContactCard";
import ShareSection from "@/components/ui/ShareSection";

export const metadata: Metadata = {
  title: "How to Help | findmystation",
  description:
    "Help fellow Kenyans find their voter registration station by contributing GPS coordinates, sharing, or volunteering.",
};

export default function ContributePage() {
  return (
    <PageShell title="How to Help">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          How You Can Help
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">
          Every contribution brings us closer to mapping all 290 IEBC offices.
          Here are the ways you can get involved.
        </p>
      </div>

      {/* ── Section 1: Drop a Pin ── */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Drop a GPS Pin
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          If you know where an IEBC constituency office is, you can mark it on the map
          in under 2 minutes. Here&apos;s how:
        </p>

        <div className="space-y-4 mb-5">
          {[
            {
              num: "1",
              title: "Search for the constituency",
              desc: "Use the search bar on the home page to find a constituency you know.",
            },
            {
              num: "2",
              title: "Tap the map to drop a pin",
              desc: "Tap the exact spot where the office is located, or use your GPS if you're nearby.",
            },
            {
              num: "3",
              title: "Choose how you appear",
              desc: "Use your real name, a nickname, or stay anonymous — we'll generate a name like \"Happy Flamingo\" for you.",
            },
            {
              num: "4",
              title: "Submit and done",
              desc: "Your pin joins others. Once 7 people confirm the same spot, it's officially verified.",
            },
          ].map((step) => (
            <div key={step.num} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                {step.num}
              </div>
              <div className="pt-0.5">
                <h3 className="text-sm font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Guidelines */}
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
          <h3 className="text-sm font-semibold text-amber-900 mb-2">Guidelines</h3>
          <ul className="space-y-1.5 text-sm text-amber-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">&#x2022;</span>
              Only pin locations you have physically visited
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">&#x2022;</span>
              One contribution per device per constituency
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">&#x2022;</span>
              Maximum 3 contributions per day
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-500">&#x2022;</span>
              Use the flag button to report incorrect verified locations
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 active:bg-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            Start Contributing
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <hr className="border-gray-100 mb-8" />

      {/* ── Section 2: Spread the Word ── */}
      <ShareSection />

      <hr className="border-gray-100 mb-8" />

      {/* ── Section 3: Volunteer ── */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Volunteer With Us
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          We&apos;re looking for people who want to take a more active role in the project.
        </p>
        <div className="space-y-3">
          {[
            {
              title: "County Ambassadors",
              desc: "Physically visit IEBC offices in your county and confirm GPS pins. You'll help verify stations faster.",
              icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
            },
            {
              title: "Translation",
              desc: "Help translate the app into Swahili and other Kenyan languages so more people can use it.",
              icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              ),
            },
            {
              title: "Data Verification",
              desc: "Cross-reference crowdsourced pins with IEBC published station lists to catch errors.",
              icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              ),
            },
            {
              title: "Development & Design",
              desc: "Developers, designers, and testers who want to improve the platform are welcome to contribute.",
              icon: (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              ),
            },
          ].map((role) => (
            <div key={role.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0 mt-0.5">{role.icon}</div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{role.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{role.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <hr className="border-gray-100 mb-8" />

      {/* ── Section 4: Partnerships ── */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Partnerships
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          We&apos;re actively looking to collaborate with organizations working in civic
          technology, voter education, and community development in Kenya.
        </p>
        <div className="space-y-2">
          {[
            { org: "IEBC", why: "Access to official station data and public endorsement" },
            { org: "Ushahidi", why: "Civic tech expertise and platform visibility" },
            { org: "Code for Africa", why: "Grant funding and continental civic tech network" },
            { org: "Uraia Trust", why: "Voter education campaigns and community outreach" },
            { org: "County civic groups & youth orgs", why: "On-the-ground station verification and awareness" },
          ].map((p) => (
            <div key={p.org} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{p.org}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{p.why}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact & Suggest */}
      <ContactCard />

      {/* Bottom CTA */}
      <div className="mt-8 bg-green-50 border border-green-100 rounded-xl p-5 text-center">
        <h3 className="text-base font-bold text-green-900 mb-1">
          Ready to help?
        </h3>
        <p className="text-sm text-green-700 mb-4">
          Start by dropping a pin — it takes less than 2 minutes.
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
            href="/about"
            className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-green-700 border border-green-200 rounded-xl hover:bg-green-50 active:bg-green-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            About Us
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
