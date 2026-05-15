"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "design", label: "Design" },
  { value: "code", label: "Code" },
  { value: "content", label: "Content" },
  { value: "data", label: "Data" },
  { value: "other", label: "Other" },
];

interface SuggestFeatureDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SuggestFeatureDrawer({
  open,
  onClose,
}: SuggestFeatureDrawerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [fileUrl, setFileUrl] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    error?: boolean;
  } | null>(null);

  if (!open) return null;

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("other");
    setFileUrl("");
    setContact("");
    setResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          file_url: fileUrl || undefined,
          contact: contact || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setResult({ message: json.message });
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setResult({ message: json.error || "Something went wrong", error: true });
      }
    } catch {
      setResult({ message: "Network error. Please try again.", error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl safe-area-bottom flex flex-col overflow-hidden">
        {/* Handle bar (mobile) */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-3 sm:pt-5 pb-5 scrollbar-thin">
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-gray-900">Suggest a Feature</h2>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Suggestions can be anything — design assets, new features, data improvements,
            accessibility ideas, or anything else you can imagine.
          </p>

          {/* Code contributions note */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-5">
            <p className="text-sm text-gray-700">
              <strong>Want to contribute code?</strong>{" "}
              Check the{" "}
              <a
                href="https://github.com/Chacha-A-Chacha/-find-my-station/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-700 font-medium underline underline-offset-2"
              >
                contribution guide
              </a>{" "}
              on GitHub for setup instructions and open issues.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="feat-title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="feat-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dark mode support"
                required
                maxLength={100}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 ${
                      category === cat.value
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label htmlFor="feat-desc" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="feat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the feature, what problem it solves, and how it should work..."
                required
                maxLength={2000}
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {description.length}/2000
              </p>
            </div>

            {/* File URL */}
            <div className="mb-4">
              <label htmlFor="feat-url" className="block text-sm font-medium text-gray-700 mb-1">
                File or Asset Link <span className="text-xs text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="feat-url"
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">
                Upload files to Google Drive, Dropbox, or any file host and paste the share link here.
              </p>
            </div>

            {/* Contact */}
            <div className="mb-5">
              <label htmlFor="feat-contact" className="block text-sm font-medium text-gray-700 mb-1">
                Your Contact <span className="text-xs text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="feat-contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Phone or email for follow-up"
                maxLength={100}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            {/* Result */}
            {result && (
              <div
                role="alert"
                className={`text-sm p-3 rounded-xl mb-4 ${
                  result.error
                    ? "bg-red-50 text-red-700 border border-red-100"
                    : "bg-green-50 text-green-700 border border-green-100"
                }`}
              >
                {result.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 h-11 text-sm font-medium text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim() || description.trim().length < 10}
                className="flex-1 h-11 text-sm font-semibold text-white bg-green-700 rounded-xl hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
              >
                {loading ? "Submitting..." : "Submit Suggestion"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
