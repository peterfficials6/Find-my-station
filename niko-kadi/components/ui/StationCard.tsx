import Link from "next/link";

interface StationCardProps {
  slug: string;
  name: string;
  type?: "office" | "centre";
  ward?: string | null;
  constituency?: string;
  constituency_slug?: string;
  county: string;
  county_slug: string;
  office_location?: string | null;
  status: string;
  confirmations: number;
  has_coordinates: boolean;
  active_until?: string | null;
  is_active?: boolean;
}

export default function StationCard({
  slug,
  name,
  type = "office",
  ward,
  constituency,
  county,
  office_location,
  status,
  has_coordinates,
  active_until,
  is_active = true,
}: StationCardProps) {
  const isVerified = status === "verified" && has_coordinates;
  const href = type === "centre" ? `/centre/${slug}` : `/station/${slug}`;

  // Breadcrumb: Ward · Constituency · County (for centres)
  // or just County (for offices)
  const breadcrumb = type === "centre" && ward
    ? `${ward} · ${constituency} · ${county}`
    : `${county} County`;

  // Active period for centres
  const activeLabel = type === "centre" && active_until
    ? is_active
      ? `Open until ${new Date(active_until).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}`
      : "Registration closed"
    : null;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-emerald-100 hover:border-emerald-200 hover:shadow-sm transition-all active:scale-[0.98]"
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
          isVerified ? "bg-emerald-100" : "bg-emerald-50"
        }`}
      >
        {type === "centre" ? (
          <svg
            className={`w-5 h-5 ${isVerified ? "text-emerald-600" : "text-emerald-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ) : (
          <svg
            className={`w-5 h-5 ${isVerified ? "text-emerald-600" : "text-emerald-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isVerified ? 2.5 : 2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isVerified ? 2.5 : 2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 truncate">{name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{breadcrumb}</p>
        {office_location && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{office_location}</p>
        )}
        {activeLabel && (
          <p className={`text-xs mt-0.5 ${is_active ? "text-emerald-600" : "text-red-500"}`}>
            {activeLabel}
          </p>
        )}
      </div>

      {/* Chevron */}
      <svg className="w-4 h-4 text-emerald-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
