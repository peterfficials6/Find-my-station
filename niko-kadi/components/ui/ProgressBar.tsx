interface ProgressBarProps {
  verified: number;
  total: number;
  pending?: number;
}

export default function ProgressBar({ verified, total, pending = 0 }: ProgressBarProps) {
  const verifiedPct = total > 0 ? (verified / total) * 100 : 0;
  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-semibold text-gray-900">
          {verified} of {total} stations verified
        </span>
        <span className="text-gray-500">{verifiedPct.toFixed(0)}%</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full flex">
          <div
            className="bg-green-600 transition-all duration-500"
            style={{ width: `${verifiedPct}%` }}
          />
          <div
            className="bg-yellow-400 transition-all duration-500"
            style={{ width: `${pendingPct}%` }}
          />
        </div>
      </div>
      <div className="flex gap-4 mt-1.5 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-600" /> Verified
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400" /> Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-200" /> Unverified
        </span>
      </div>
    </div>
  );
}
