"use client";

import { useState } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Loader2, 
  Calendar,
  Filter,
  BarChart3,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { showError } from "@/lib/swal";
import { PageHelp } from "@/components/ui/page-help";
import { pageHelpConfig } from "@/lib/page-help-config";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ReportData {
  count: number;
  tickets: Array<{
    ticketCode: string;
    subject: string;
    status: string;
    fullName: string;
    bureau: string;
    category: string;
    priority: string;
    team: string;
    assignee: string;
    createdAt: string;
  }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  NEW: { label: "รับแจ้งใหม่", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "กำลังดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
  WAITING_USER: { label: "รอข้อมูล", color: "bg-orange-100 text-orange-800" },
  RESOLVED: { label: "แก้ไขแล้ว", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "ปิดงาน", color: "bg-gray-100 text-gray-800" },
  REJECTED: { label: "ไม่รับดำเนินการ", color: "bg-red-100 text-red-800" },
};

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [filters, setFilters] = useState({
    startDate: firstDayOfMonth.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
    status: "all",
  });

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
        format: "json",
      });

      const response = await fetch(`/api/admin/reports/tickets?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }

      const data = await response.json();
      setReportData(data);
    } catch {
      showError("ไม่สามารถโหลดรายงานได้");
    } finally {
      setIsLoading(false);
    }
  };

  const exportExcel = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        status: filters.status,
        format: "excel",
      });

      const response = await fetch(`/api/admin/reports/tickets?${params}`);
      if (!response.ok) {
        throw new Error("Failed to export");
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tickets_report_${filters.startDate}_to_${filters.endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch {
      showError("ไม่สามารถ export ไฟล์ได้");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-purple-600 rounded-xl shadow-lg shadow-purple-600/25">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">รายงาน</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              ดูสถิติและ export รายงาน Ticket
            </p>
          </div>
        </div>
      </div>

      {/* Help */}
      <PageHelp items={pageHelpConfig["admin-reports"]} />

      {/* Quick Links */}
      <div className="mb-6">
        <Link href="/admin/reports/sla">
          <Card className="hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 max-w-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">รายงาน SLA</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ticket ที่ค้างและเกินเวลา SLA
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6 rounded-xl border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            ตัวกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                วันที่เริ่มต้น
              </Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                วันที่สิ้นสุด
              </Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {Object.entries(statusLabels).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={fetchReport}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Filter className="h-4 w-4 mr-2" />
                )}
                ดูรายงาน
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="rounded-xl">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {reportData.count}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tickets ทั้งหมด</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl sm:col-span-2">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Export รายงาน</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ดาวน์โหลดรายงานเป็นไฟล์ Excel
                    </p>
                  </div>
                  <Button
                    onClick={exportExcel}
                    disabled={isExporting}
                    className="bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table - Desktop */}
          <Card className="rounded-xl hidden lg:block">
            <CardHeader>
              <CardTitle className="text-base">รายการ Ticket</CardTitle>
              <CardDescription>แสดง {reportData.tickets.length} รายการ</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead>รหัส</TableHead>
                    <TableHead className="w-[300px]">หัวข้อ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>ผู้แจ้ง</TableHead>
                    <TableHead>หมวดหมู่</TableHead>
                    <TableHead>ทีม</TableHead>
                    <TableHead>วันที่แจ้ง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.tickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        ไม่พบข้อมูล
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData.tickets.slice(0, 50).map((ticket) => (
                      <TableRow key={ticket.ticketCode}>
                        <TableCell className="font-mono text-sm">{ticket.ticketCode}</TableCell>
                        <TableCell className="truncate max-w-[300px]">{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge className={statusLabels[ticket.status]?.color || "bg-gray-100"}>
                            {statusLabels[ticket.status]?.label || ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{ticket.fullName}</TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell>{ticket.team}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(ticket.createdAt).toLocaleDateString("th-TH")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {reportData.tickets.length > 50 && (
                <div className="p-4 text-center text-sm text-gray-500 border-t">
                  แสดง 50 รายการแรก - ดาวน์โหลด Excel เพื่อดูทั้งหมด
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards - Mobile */}
          <div className="lg:hidden space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">
              รายการ Ticket ({reportData.tickets.length})
            </h3>
            {reportData.tickets.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">ไม่พบข้อมูล</p>
              </Card>
            ) : (
              reportData.tickets.slice(0, 20).map((ticket) => (
                <Card key={ticket.ticketCode} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-sm text-blue-600">{ticket.ticketCode}</span>
                    <Badge className={`${statusLabels[ticket.status]?.color || "bg-gray-100"} text-xs`}>
                      {statusLabels[ticket.status]?.label || ticket.status}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm mb-2 line-clamp-2">{ticket.subject}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>{ticket.fullName}</span>
                    <span>•</span>
                    <span>{ticket.category}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString("th-TH")}</span>
                  </div>
                </Card>
              ))
            )}
            {reportData.tickets.length > 20 && (
              <p className="text-center text-sm text-gray-500">
                แสดง 20 รายการแรก - ดาวน์โหลด Excel เพื่อดูทั้งหมด
              </p>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!reportData && !isLoading && (
        <Card className="rounded-xl">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              เลือกช่วงเวลาและกดดูรายงาน
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              ระบบจะแสดงรายการ Ticket ตามเงื่อนไขที่เลือก
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
