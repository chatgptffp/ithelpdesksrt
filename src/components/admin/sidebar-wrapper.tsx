"use client";

import dynamic from "next/dynamic";

const AdminSidebar = dynamic(() => import("./sidebar"), {
  ssr: false,
  loading: () => (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-100 rounded animate-pulse" />
            <span className="text-lg font-bold text-gray-300">Loading...</span>
          </div>
        </div>
      </div>
    </aside>
  ),
});

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  roles: string[];
}

export default function SidebarWrapper({ user }: { user: User }) {
  return <AdminSidebar user={user} />;
}
