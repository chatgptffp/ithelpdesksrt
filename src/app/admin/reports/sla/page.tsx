"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Loader2,
  ArrowLeft,
  AlertCircle,
  Timer
} from "lucide-react";
import { PageHelp } from "@/components/ui/page-help";
import { pageHelpConfig } from "@/lib/page-help-config";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TicketSLA {
  id: string;
  ticketCode: string;
  subject: string;
  status: string;
  fullName: string;
  bureau: string;
  createdAt: string;
  priority: string;
  team: string;
  assignee: string;
  ageMinutes: number;
  ageText: string;
  slaResponseMinutes: number;
  slaResolveMinutes: number;
  responseBreached: boolean;
  resolveBreached: boolean;
  responsePercent: number;
  resolvePercent: number;
}

interface SLAData {
  summary: {
    total: number;
    breached: number;
    atRisk: number;
    onTrack: number;
    breachedPercent: number;
  };
  breachedTickets: TicketSLA[];
  atRiskTickets: TicketSLA[];
  onTrackTickets: TicketSLA[];
}

const statusLabels: Record<string, string> = {
  NEW: "รับแจ้งใหม่",
  IN_PROGRESS: "กำลังดำเนินการ",
  WAITING_USER: "รอข้อมูล",
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  WAITING_USER: "bg-orange-100 text-orange-800",
};

function TicketCard({ ticket }: { ticket: TicketSLA }) {
  return (
    <Link href={`/admin/tickets/${ticket.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-medium text-blue-600">
                  {ticket.ticketCode}
                </span>
                <Badge className={statusColors[ticket.status]}>
                  {statusLabels[ticket.status]}
                </Badge>
                {ticket.resolveBreached && (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    เกิน SLA
                  </Badge>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {ticket.subject}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                <span>{ticket.fullName}</span>
                <span>{ticket.team}</span>
                <span>{ticket.assignee}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Timer className="h-4 w-4" />
                {ticket.ageText}
              </div>
              <div className="mt-2 w-24">
                <div className="text-xs text-gray-500 mb-1">
                  SLA: {ticket.resolvePercent}%
                </div>
                <Progress 
                  value={ticket.resolvePercent} 
                  className={`h-2 ${
                    ticket.resolveBreached ? "bg-red-200" : 
                    ticket.resolvePercent >= 75 ? "bg-yellow-200" : "bg-gray-200"
                  }`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function SLAReportPage() {
  const [data, setData] = useState<SLAData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/reports/sla");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch SLA data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        ไม่สามารถโหลดข้อมูลได้
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/admin/reports" 
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          กลับหน้ารายงาน
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/25">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              รายงาน SLA
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ticket ที่ค้างและเกินเวลา SLA
            </p>
          </div>
        </div>
      </div>

      {/* Help */}
      <PageHelp items={pageHelpConfig["admin-sla-report"]} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.summary.total}
                </p>
                <p className="text-xs text-gray-500">Ticket ค้างทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {data.summary.breached}
                </p>
                <p className="text-xs text-gray-500">เกิน SLA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {data.summary.atRisk}
                </p>
                <p className="text-xs text-gray-500">ใกล้เกิน SLA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {data.summary.onTrack}
                </p>
                <p className="text-xs text-gray-500">ปกติ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-base">รายการ Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="breached">
            <TabsList className="mb-4">
              <TabsTrigger value="breached" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                เกิน SLA ({data.summary.breached})
              </TabsTrigger>
              <TabsTrigger value="atRisk" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                ใกล้เกิน ({data.summary.atRisk})
              </TabsTrigger>
              <TabsTrigger value="onTrack" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                ปกติ ({data.summary.onTrack})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="breached" className="space-y-3">
              {data.breachedTickets.length === 0 ? (
                <p className="text-center text-gray-500 py-8">ไม่มี Ticket เกิน SLA 🎉</p>
              ) : (
                data.breachedTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))
              )}
            </TabsContent>

            <TabsContent value="atRisk" className="space-y-3">
              {data.atRiskTickets.length === 0 ? (
                <p className="text-center text-gray-500 py-8">ไม่มี Ticket ใกล้เกิน SLA</p>
              ) : (
                data.atRiskTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))
              )}
            </TabsContent>

            <TabsContent value="onTrack" className="space-y-3">
              {data.onTrackTickets.length === 0 ? (
                <p className="text-center text-gray-500 py-8">ไม่มี Ticket ค้าง</p>
              ) : (
                data.onTrackTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
