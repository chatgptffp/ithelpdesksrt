import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

type TicketStatus = "NEW" | "IN_PROGRESS" | "WAITING_USER" | "RESOLVED" | "CLOSED" | "REJECTED";

const statusConfig: Record<TicketStatus, { label: string; color: string }> = {
  NEW: { label: "ใหม่", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "กำลังดำเนินการ", color: "bg-yellow-100 text-yellow-800" },
  WAITING_USER: { label: "รอข้อมูล", color: "bg-orange-100 text-orange-800" },
  RESOLVED: { label: "แก้ไขแล้ว", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "ปิดงาน", color: "bg-gray-100 text-gray-800" },
  REJECTED: { label: "ปฏิเสธ", color: "bg-red-100 text-red-800" },
};

interface SearchParams {
  status?: string;
  page?: string;
}

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const statusFilter = params.status as TicketStatus | undefined;
  const page = parseInt(params.page || "1");
  const pageSize = 20;

  const where = statusFilter ? { status: statusFilter } : {};

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        category: { select: { name: true } },
        priority: { select: { name: true, severity: true } },
        assignee: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  // Get counts by status
  const statusCounts = await prisma.ticket.groupBy({
    by: ["status"],
    _count: true,
  });

  const countsByStatus = Object.fromEntries(
    statusCounts.map((s: { status: string; _count: number }) => [s.status, s._count])
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">รายการ Ticket</h1>
          <p className="text-gray-600 dark:text-gray-400">จัดการและติดตาม Ticket ทั้งหมด</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <Card className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/tickets">
              <Button
                variant={!statusFilter ? "default" : "outline"}
                size="sm"
                className={!statusFilter ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                ทั้งหมด ({total})
              </Button>
            </Link>
            {(Object.keys(statusConfig) as TicketStatus[]).map((status) => (
              <Link key={status} href={`/admin/tickets?status=${status}`}>
                <Button
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  className={statusFilter === status ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {statusConfig[status].label} ({countsByStatus[status] || 0})
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                <TableHead>รหัส Ticket</TableHead>
                <TableHead>หัวข้อ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>ผู้แจ้ง</TableHead>
                <TableHead>ผู้รับผิดชอบ</TableHead>
                <TableHead>วันที่แจ้ง</TableHead>
                <TableHead className="w-[100px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    ไม่พบข้อมูล Ticket
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket: {
                id: string;
                ticketCode: string;
                subject: string;
                status: TicketStatus;
                fullName: string;
                department: string;
                createdAt: Date;
                category: { name: string } | null;
                assignee: { displayName: string } | null;
              }) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <TableCell className="font-mono font-medium text-blue-600 dark:text-blue-400">
                      {ticket.ticketCode}
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[ticket.status].color}>
                        {statusConfig[ticket.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.category?.name || "-"}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.fullName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ticket.assignee?.displayName || (
                        <span className="text-gray-400">ยังไม่มอบหมาย</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(ticket.createdAt), "d MMM yy HH:mm", {
                        locale: th,
                      })}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/tickets?${statusFilter ? `status=${statusFilter}&` : ""}page=${p}`}
            >
              <Button
                variant={page === p ? "default" : "outline"}
                size="sm"
                className={page === p ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
