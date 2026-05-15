type Status = "verified" | "pending" | "unverified" | "flagged";

interface StatusConfig {
  label: string;
  className: string;
  icon?: string;
}

const statusConfig: Record<Status, StatusConfig> = {
  verified: {
    label: "GPS Verified",
    className: "bg-green-100 text-green-800",
  },
  pending: {
    label: "Confirming",
    className: "bg-amber-100 text-amber-800",
  },
  unverified: {
    label: "Needs GPS",
    className: "bg-blue-50 text-blue-600",
  },
  flagged: {
    label: "Under Review",
    className: "bg-red-100 text-red-800",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as Status] || statusConfig.unverified;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {status === "verified" && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {config.label}
    </span>
  );
}
