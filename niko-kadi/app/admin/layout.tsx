import { verifySession } from "@/lib/admin/session";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: { default: "Admin Dashboard", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if this is the login page by reading the URL from headers
  // Login page doesn't need auth
  const session = await verifySession();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-y-auto" style={{ height: "100vh", overflowY: "auto" }}>
      {session ? (
        <>
          <Sidebar />
          <main className="md:ml-56 min-h-screen pt-12 md:pt-0">
            <div className="p-4 sm:p-6 lg:p-8 pb-16">{children}</div>
          </main>
        </>
      ) : (
        <main className="min-h-screen">{children}</main>
      )}
    </div>
  );
}
