"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Shield, ArrowLeft, Loader2, Search, Ticket, User, HelpCircle } from "lucide-react";
import { PageHelp } from "@/components/ui/page-help";
import { pageHelpConfig } from "@/lib/page-help-config";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { trackTicketSchema, type TrackTicketInput } from "@/lib/validations/ticket";

function TrackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TrackTicketInput>({
    resolver: zodResolver(trackTicketSchema),
    defaultValues: {
      ticketCode: searchParams.get("code") || "",
      employeeCode: "",
    },
  });

  const onSubmit = async (data: TrackTicketInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tickets/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่พบข้อมูล Ticket");
      }

      // Store employee code in session storage for survey
      sessionStorage.setItem("employeeCode", data.employeeCode);
      
      // Navigate to ticket detail
      router.push(`/track/${data.ticketCode.toUpperCase()}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
          <Search className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
        <CardTitle className="text-2xl">ติดตามสถานะ</CardTitle>
        <CardDescription>
          กรอกรหัส Ticket และรหัสพนักงานเพื่อดูความคืบหน้า
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="ticketCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-green-600" />
                    รหัส Ticket *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="เช่น IT-AB12CD" 
                      className="text-center font-mono tracking-wider uppercase"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    รหัสพนักงาน *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="รหัสพนักงานที่ใช้แจ้งปัญหา" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังค้นหา...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  ค้นหา Ticket
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">ลืมรหัส Ticket?</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                กรุณาติดต่อเจ้าหน้าที่ IT โทร. 1234
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrackPage() {
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
          <Link href="/report">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 text-xs sm:text-sm">
              แจ้งปัญหาใหม่
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>

        {/* Help */}
        <PageHelp items={pageHelpConfig["public-track"]} />

        <Suspense fallback={
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400 mt-2">กำลังโหลด...</p>
          </div>
        }>
          <TrackForm />
        </Suspense>
      </main>
    </div>
  );
}
