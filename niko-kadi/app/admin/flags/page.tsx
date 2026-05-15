import { redirect } from "next/navigation";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";
import FlagsTable from "@/components/admin/FlagsTable";

export const metadata = { title: "Flags" };

export default async function FlagsPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");

  const flags = await prisma.flag.findMany({
    include: {
      constituency: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = flags.map((f: typeof flags[number]) => ({
    id: f.id,
    constituency: f.constituency.name,
    constituencySlug: f.constituency.slug,
    reason: f.reason || "No reason given",
    deviceFingerprint: f.deviceFingerprint,
    createdAt: f.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Flags</h1>
        <span className="text-sm text-gray-400">{rows.length} total</span>
      </div>
      <FlagsTable rows={rows} />
    </div>
  );
}
