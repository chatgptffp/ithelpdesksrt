"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText, Search, RefreshCw, User, Monitor, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface AuditLog {
  id: string;
  actorStaffId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  actorStaff?: {
    displayName: string;
    email: string;
  } | null;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  LOGIN: { label: "เข้าสู่ระบบ", color: "bg-green-100 text-green-800" },
  LOGOUT: { label: "ออกจากระบบ", color: "bg-gray-100 text-gray-800" },
  CREATE_TICKET: { label: "สร้าง Ticket", color: "bg-blue-100 text-blue-800" },
  UPDATE_TICKET: { label: "อัปเดต Ticket", color: "bg-yellow-100 text-yellow-800" },
  DELETE_TICKET: { label: "ลบ Ticket", color: "bg-red-100 text-red-800" },
  VIEW_TICKET: { label: "ดู Ticket", color: "bg-purple-100 text-purple-800" },
  CREATE_USER: { label: "สร้างผู้ใช้", color: "bg-blue-100 text-blue-800" },
  UPDATE_USER: { label: "อัปเดตผู้ใช้", color: "bg-yellow-100 text-yellow-800" },
  DELETE_USER: { label: "ลบผู้ใช้", color: "bg-red-100 text-red-800" },
  CHANGE_PASSWORD: { label: "เปลี่ยนรหัสผ่าน", color: "bg-orange-100 text-orange-800" },
  EXPORT_DATA: { label: "ส่งออกข้อมูล", color: "bg-indigo-100 text-indigo-800" },
  SYSTEM_CONFIG: { label: "ตั้งค่าระบบ", color: "bg-pink-100 text-pink-800" },
  FAILED_LOGIN: { label: "เข้าสู่ระบบล้มเหลว", color: "bg-red-100 text-red-800" },
  SUSPICIOUS_ACTIVITY: { label: "กิจกรรมน่าสงสัย", color: "bg-red-200 text-red-900" },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });
      if (actionFilter !== "all") {
        params.append("action", actionFilter);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const res = await fetch(`/api/admin/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    const config = actionLabels[action] || { label: action, color: "bg-gray-100 text-gray-800" };
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return "ไม่ทราบ";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "อื่นๆ";
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <ScrollText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Log</h1>
            <p className="text-gray-600 dark:text-gray-400">ประวัติการใช้งานระบบทั้งหมด</p>
          </div>
        </div>
        <Button onClick={fetchLogs} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          รีเฟรช
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4 bg-white dark:bg-gray-800">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ค้นหา IP, ผู้ใช้..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="ประเภทกิจกรรม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {Object.entries(actionLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              ค้นหา
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                <TableHead>เวลา</TableHead>
                <TableHead>ผู้ใช้</TableHead>
                <TableHead>กิจกรรม</TableHead>
                <TableHead>รายละเอียด</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Browser</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">กำลังโหลด...</p>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <ScrollText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">ไม่พบข้อมูล Log</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {format(new Date(log.createdAt), "dd MMM yyyy", { locale: th })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(log.createdAt), "HH:mm:ss")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {log.actorStaff?.displayName || "ระบบ"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.actorStaff?.email || "-"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-gray-500">{log.entityType}</span>
                        {log.entityId && (
                          <span className="ml-1 text-gray-400">#{log.entityId.slice(0, 8)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono">{log.ip || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{parseUserAgent(log.userAgent)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ก่อนหน้า
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            หน้า {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            ถัดไป
          </Button>
        </div>
      )}
    </div>
  );
}
