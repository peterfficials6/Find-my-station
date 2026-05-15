import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-full flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-sm text-gray-600 mb-6">
          This page could not be found.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl active:bg-green-800 transition-colors"
        >
          Back to Map
        </Link>
      </div>
    </div>
  );
}
