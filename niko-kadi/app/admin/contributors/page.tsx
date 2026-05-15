import { redirect } from "next/navigation";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";

export const metadata = { title: "Contributors" };

export default async function ContributorsPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");

  const contributors = await prisma.contributorIdentity.findMany({
    orderBy: { contributionCount: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Top Contributors</h1>

      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full text-sm"
            aria-label="Top contributors table"
          >
            <thead>
              <tr className="text-left text-xs text-gray-400 border-b border-gray-700">
                <th className="px-4 py-3 font-medium w-16 text-center">
                  Rank
                </th>
                <th className="px-4 py-3 font-medium">Display Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">
                  Contributions
                </th>
                <th className="px-4 py-3 font-medium text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {contributors.map((c: { id: string; displayName: string; identityType: string; contributionCount: number; createdAt: Date }, idx: number) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-700/50 hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-3 text-center text-gray-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {c.displayName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.identityType === "named"
                          ? "text-green-400 bg-green-400/10"
                          : c.identityType === "nicknamed"
                            ? "text-blue-400 bg-blue-400/10"
                            : "text-gray-400 bg-gray-400/10"
                      }`}
                    >
                      {c.identityType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300 font-medium">
                    {c.contributionCount}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 text-xs">
                    {c.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {contributors.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No contributors yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
