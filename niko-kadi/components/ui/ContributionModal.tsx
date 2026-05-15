"use client";

import { useState } from "react";

interface ContributionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    display_name: string;
    identity_type: "named" | "nicknamed" | "anonymous";
  }) => void;
  loading: boolean;
}

export default function ContributionModal({
  open,
  onClose,
  onSubmit,
  loading,
}: ContributionModalProps) {
  const [identityType, setIdentityType] = useState<"named" | "nicknamed" | "anonymous">(
    "anonymous"
  );
  const [displayName, setDisplayName] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ display_name: displayName, identity_type: identityType });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl p-6 safe-area-bottom">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Confirm Location
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          How would you like to be identified?
        </p>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 mb-4">
            {(
              [
                { value: "anonymous", label: "Stay anonymous", desc: "A fun name will be generated for you" },
                { value: "nicknamed", label: "Use a nickname", desc: "Choose your own alias" },
                { value: "named", label: "Use my real name", desc: "Your name will be shown publicly" },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  identityType === option.value
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="identity"
                  value={option.value}
                  checked={identityType === option.value}
                  onChange={() => setIdentityType(option.value)}
                  className="mt-0.5 accent-green-700"
                />
                <div>
                  <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                  <p className="text-xs text-gray-500">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {identityType !== "anonymous" && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={identityType === "named" ? "Your name" : "Your nickname"}
              required
              maxLength={50}
              className="w-full h-10 px-3 mb-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (identityType !== "anonymous" && !displayName.trim())}
              className="flex-1 h-10 text-sm font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Confirm & Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
