import { redirect } from "next/navigation";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";

export default async function SuggestionsPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");

  const suggestions = await prisma.featureSuggestion.findMany({
    orderBy: { createdAt: "desc" },
  });

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    reviewed: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-gray-100 text-gray-500",
  };

  const categoryColors: Record<string, string> = {
    design: "bg-purple-100 text-purple-700",
    code: "bg-sky-100 text-sky-700",
    content: "bg-amber-100 text-amber-700",
    data: "bg-teal-100 text-teal-700",
    other: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Feature Suggestions</h1>
        <span className="text-sm text-gray-400">{suggestions.length} total</span>
      </div>

      {suggestions.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-400">No suggestions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((s: typeof suggestions[number]) => (
            <div key={s.id} className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[s.category] || categoryColors.other}`}>
                    {s.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[s.status] || statusColors.new}`}>
                    {s.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">{s.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <time>{new Date(s.createdAt).toLocaleDateString()}</time>
                {s.contact && <span>Contact: {s.contact}</span>}
                {s.fileUrl && (
                  <a
                    href={s.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 underline"
                  >
                    View attachment
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
