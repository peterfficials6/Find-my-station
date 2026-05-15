import { redirect } from "next/navigation";
import { verifySession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma/client";
import DataTable from "@/components/admin/DataTable";

export const metadata = { title: "Station Data" };

export default async function DataPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");

  const constituencies = await prisma.constituency.findMany({
    include: {
      county: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  const rows = constituencies.map((c: typeof constituencies[number]) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    county: c.county.name,
    status: c.verificationStatus,
    confirmations: c.confirmationCount,
    hasGps: c.verifiedLat !== null && c.verifiedLng !== null,
  }));

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-6">Station Data</h1>
      <DataTable rows={rows} />
    </div>
  );
}
