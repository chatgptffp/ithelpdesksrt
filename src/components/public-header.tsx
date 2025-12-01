"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, BookOpen } from "lucide-react";
import { useBranding } from "@/contexts/branding-context";

export function PublicHeader() {
  const { branding } = useBranding();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
          {branding.logoUrl ? (
            <img 
              src={branding.logoUrl} 
              alt={branding.name} 
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg shadow-lg object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
            />
          ) : null}
          <div className={`p-1.5 sm:p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20 ${branding.logoUrl ? 'hidden' : ''}`}>
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{branding.name}</span>
            {branding.code && (
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden xs:block">{branding.code}</p>
            )}
          </div>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/knowledge-base" className="hidden md:block">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-blue-600">
              <BookOpen className="h-4 w-4 mr-2" />
              สถานีความรู้
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 text-xs sm:text-sm">
              เข้าสู่ระบบ
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
