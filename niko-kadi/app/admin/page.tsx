import { redirect } from "next/navigation";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";
import { getActiveCount } from "@/lib/admin/heartbeat";
import StatCard from "@/components/admin/StatCard";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let totalConstituencies = 0,
    verified = 0,
    pending = 0,
    flagged = 0,
    totalContributions = 0,
    todayContributions = 0,
    totalContributors = 0,
    totalFlags = 0;

  try {
    [
      totalConstituencies,
      verified,
      pending,
      flagged,
      totalContributions,
      todayContributions,
      totalContributors,
      totalFlags,
    ] = await Promise.all([
      prisma.constituency.count(),
      prisma.constituency.count({ where: { verificationStatus: "verified" } }),
      prisma.constituency.count({ where: { verificationStatus: "pending" } }),
      prisma.constituency.count({ where: { verificationStatus: "flagged" } }),
      prisma.contribution.count(),
      prisma.contribution.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.contributorIdentity.count(),
      prisma.flag.count(),
    ]);
  } catch {
    // DB error — show zeros
  }

  const unverified = totalConstituencies - verified - pending - flagged;
  const verifiedPct = totalConstituencies > 0 ? Math.round((verified / totalConstituencies) * 100) : 0;

  const quickLinks = [
    {
      href: "/admin/live",
      label: "Live Users",
      desc: "See who\u2019s online right now",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      ),
    },
    {
      href: "/admin/stats",
      label: "County Stats",
      desc: "Verification breakdown by county",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: "/admin/flags",
      label: "Review Flags",
      desc: `${totalFlags} pending review`,
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Welcome back, {session.username}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {getActiveCount()} online
        </div>
      </div>

      {/* Verification progress */}
      <div className="bg-gray-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">Verification Progress</h2>
          <span className="text-2xl font-bold text-emerald-400">{verifiedPct}%</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
          <div className="h-full flex">
            <div className="bg-emerald-500 transition-all" style={{ width: `${totalConstituencies > 0 ? (verified / totalConstituencies) * 100 : 0}%` }} />
            <div className="bg-amber-500 transition-all" style={{ width: `${totalConstituencies > 0 ? (pending / totalConstituencies) * 100 : 0}%` }} />
            <div className="bg-red-400 transition-all" style={{ width: `${totalConstituencies > 0 ? (flagged / totalConstituencies) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />{verified} Verified</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />{pending} Pending</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-600" />{unverified} Needs GPS</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />{flagged} Flagged</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Stations" value={totalConstituencies} color="gray" />
        <StatCard label="Contributions" value={totalContributions} sub={`${todayContributions} today`} color="blue" />
        <StatCard label="Contributors" value={totalContributors} color="green" />
        <StatCard label="Flags" value={totalFlags} color={totalFlags > 0 ? "red" : "gray"} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-gray-800 rounded-xl p-4 hover:bg-gray-800/80 transition-colors group flex items-start gap-3"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              {link.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{link.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
