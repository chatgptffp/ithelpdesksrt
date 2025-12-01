"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  Ticket,
  Users,
  UsersRound,
  Building2,
  FolderTree,
  LogOut,
  ChevronDown,
  Gauge,
  Server,
  BookOpen,
  Menu,
  X,
  BarChart3,
  FileText,
  MessageSquareText,
  Settings,
  Palette,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useLanguage } from "@/lib/i18n";
import { useBranding } from "@/contexts/branding-context";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  roles: string[];
}

export default function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname() || "/admin";
  const { branding } = useBranding();
  const { t } = useLanguage();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [newTicketsCount, setNewTicketsCount] = useState(0);

  // Fetch new tickets count
  const fetchNewTicketsCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tickets/count");
      if (res.ok) {
        const data = await res.json();
        setNewTicketsCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching tickets count:", error);
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Fetch count on mount and every 30 seconds
  useEffect(() => {
    fetchNewTicketsCount();
    const interval = setInterval(fetchNewTicketsCount, 30000);
    return () => clearInterval(interval);
  }, [fetchNewTicketsCount]);

  const navigation = [
    { name: t.sidebar.dashboard, href: "/admin", icon: LayoutDashboard },
    { name: t.sidebar.tickets, href: "/admin/tickets", icon: Ticket },
    { name: t.sidebar.teams, href: "/admin/teams", icon: UsersRound },
    { name: "Knowledge Base", href: "/admin/knowledge-base", icon: BookOpen },
    { name: "Template ปัญหา", href: "/admin/templates", icon: FileText },
    { name: "ข้อความสำเร็จรูป", href: "/admin/canned-responses", icon: MessageSquareText },
    { name: "รายงาน", href: "/admin/reports", icon: BarChart3 },
  ];

  const masterDataNavigation = [
    { name: t.sidebar.categories, href: "/admin/master-data/categories", icon: FolderTree },
    { name: t.sidebar.priorities, href: "/admin/master-data/priorities", icon: Gauge },
    { name: t.sidebar.systems, href: "/admin/master-data/systems", icon: Server },
    { name: t.sidebar.orgUnits, href: "/admin/master-data/org-units", icon: Building2 },
  ];

  const adminNavigation = [
    { name: t.sidebar.users, href: "/admin/users", icon: Users },
  ];

  const settingsNavigation = [
    { name: "ตั้งค่า Branding", href: "/admin/settings/branding", icon: Palette },
    { name: "การแจ้งเตือน", href: "/admin/settings/notifications", icon: Bell },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const NavLinks = () => (
    <>
      {/* Main Navigation */}
      <div className="space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const isTickets = item.href === "/admin/tickets";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate flex-1">{item.name}</span>
              {isTickets && newTicketsCount > 0 && (
                <Badge 
                  className={cn(
                    "ml-auto text-xs px-2 py-0.5 min-w-[20px] justify-center",
                    active 
                      ? "bg-white text-blue-600" 
                      : "bg-red-500 text-white"
                  )}
                >
                  {newTicketsCount > 99 ? "99+" : newTicketsCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      {/* Master Data */}
      <div className="mt-6">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          {t.sidebar.masterData}
        </p>
        <div className="space-y-1">
          {masterDataNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Settings - แสดงสำหรับทุกคน */}
      <div className="mt-6">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          {t.common.settings}
        </p>
        <div className="space-y-1">
          {adminNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
          {settingsNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.name} className="h-10 w-10 rounded-lg object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            ) : null}
            <div className={`p-2 bg-blue-600 rounded-lg ${branding.logoUrl ? 'hidden' : ''}`}>
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{branding.name}</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="lg:hidden"
            >
              {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo - Desktop */}
          <div className="hidden lg:flex h-20 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5">
            <Link href="/admin" className="flex items-center gap-3">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.name} className="h-12 w-12 rounded-xl object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              ) : null}
              <div className={`p-2.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 ${branding.logoUrl ? 'hidden' : ''}`}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">{branding.name}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.sidebar.adminPanel}</p>
              </div>
            </Link>
            <div className="flex gap-1">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>

          {/* Mobile Header Spacer */}
          <div className="lg:hidden h-16" />

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <NavLinks />
          </nav>

          {/* User Menu */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-3 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.roles?.join(", ") || "User"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.common.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
}
