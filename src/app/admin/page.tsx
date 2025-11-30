import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Ticket, 
  Clock, 
  AlertCircle,
  Star,
  TrendingUp 
} from "lucide-react";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

async function getDashboardStats() {
  const [
    totalTickets,
    newTickets,
    inProgressTickets,
    resolvedTickets,
    avgRating,
    todayTickets,
  ] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "NEW" } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.satisfactionSurvey.aggregate({
      _avg: { rating: true },
    }),
    prisma.ticket.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  return {
    totalTickets,
    newTickets,
    inProgressTickets,
    resolvedTickets,
    avgRating: avgRating._avg.rating || 0,
    todayTickets,
  };
}

async function getRecentTickets() {
  return prisma.ticket.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      priority: { select: { name: true } },
      assignee: { select: { displayName: true } },
    },
  });
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin/login");
  }

  const [stats, recentTickets] = await Promise.all([
    getDashboardStats(),
    getRecentTickets(),
  ]);

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    WAITING_USER: "bg-orange-100 text-orange-800",
    RESOLVED: "bg-green-100 text-green-800",
    CLOSED: "bg-gray-100 text-gray-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    NEW: "ใหม่",
    IN_PROGRESS: "กำลังดำเนินการ",
    WAITING_USER: "รอข้อมูล",
    RESOLVED: "แก้ไขแล้ว",
    CLOSED: "ปิดงาน",
    REJECTED: "ปฏิเสธ",
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          ยินดีต้อนรับ, {session.user.name || session.user.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Ticket ทั้งหมด
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Ticket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTickets}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              +{stats.todayTickets} วันนี้
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              รอดำเนินการ
            </CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.newTickets}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ticket ใหม่</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              กำลังดำเนินการ
            </CardTitle>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.inProgressTickets}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ticket ที่กำลังทำ</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              ความพึงพอใจเฉลี่ย
            </CardTitle>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Star className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.avgRating.toFixed(1)}
              <span className="text-lg text-gray-400">/5</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">จากแบบประเมิน</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mb-6">
        <DashboardCharts />
      </div>

      {/* Recent Tickets */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Ticket ล่าสุด
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentTickets.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">ยังไม่มี Ticket</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {recentTickets.map((ticket: {
                id: string;
                ticketCode: string;
                status: string;
                subject: string;
                fullName: string;
                department: string;
                createdAt: Date;
                category: { name: string } | null;
              }) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                        {ticket.ticketCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          statusColors[ticket.status]
                        }`}
                      >
                        {statusLabels[ticket.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium truncate max-w-md">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {ticket.fullName} • {ticket.department}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <p>{ticket.category?.name || "-"}</p>
                    <p className="text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
