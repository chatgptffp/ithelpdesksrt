"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle2, Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const ticketCode = searchParams.get("ticketCode");

  const copyToClipboard = () => {
    if (ticketCode) {
      navigator.clipboard.writeText(ticketCode);
      toast.success("คัดลอกรหัส Ticket แล้ว");
    }
  };

  if (!ticketCode) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400">ไม่พบข้อมูล Ticket</p>
        <Link href="/report">
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">แจ้งปัญหาใหม่</Button>
        </Link>
      </div>
    );
  }

  return (
    <Card className="max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl text-green-600 dark:text-green-400">ส่งเรื่องสำเร็จ!</CardTitle>
        <CardDescription>
          ระบบได้รับข้อมูลการแจ้งปัญหาของคุณแล้ว
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-5 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">รหัส Ticket ของคุณ</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-wider font-mono">
              {ticketCode}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              title="คัดลอกรหัส"
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-amber-800 dark:text-amber-300 text-sm">
            <strong>สำคัญ:</strong> กรุณาบันทึกรหัส Ticket นี้ไว้ 
            คุณจะต้องใช้รหัสนี้พร้อมกับรหัสพนักงานในการติดตามสถานะ
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/track?code=${ticketCode}`} className="flex-1">
            <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
              <Search className="mr-2 h-4 w-4" />
              ติดตามสถานะ
            </Button>
          </Link>
          <Link href="/report" className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              แจ้งปัญหาใหม่
            </Button>
          </Link>
        </div>

        <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            กลับหน้าหลัก
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">IT Helpdesk</span>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden xs:block">การรถไฟแห่งประเทศไทย</p>
            </div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Suspense fallback={
          <div className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400">กำลังโหลด...</p>
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
