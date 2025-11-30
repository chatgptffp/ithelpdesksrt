import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SidebarWrapper from "@/components/admin/sidebar-wrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Allow access to login page without session
  // The middleware will handle other routes
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SidebarWrapper user={session.user} />
      {/* Main Content - responsive margin */}
      <main className="min-h-screen pt-16 lg:pt-0 lg:ml-72">
        {children}
      </main>
    </div>
  );
}
