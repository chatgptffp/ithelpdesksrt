"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  Shield,
  ArrowLeft,
  Loader2,
  Clock,
  User,
  FileText,
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface TicketData {
  ticketCode: string;
  status: string;
  subject: string;
  description: string;
  fullName: string;
  employeeCodeMasked: string;
  bureau: string;
  division: string;
  department: string;
  category?: string;
  priority?: string;
  prioritySeverity?: number;
  system?: string;
  assignee?: string;
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
  }>;
  comments: Array<{
    id: string;
    authorType: string;
    authorName: string;
    message: string;
    createdAt: string;
  }>;
  statusLogs: Array<{
    id: string;
    fromStatus?: string;
    toStatus: string;
    note?: string;
    createdAt: string;
  }>;
  survey?: {
    rating: number;
    feedback?: string;
    createdAt: string;
  };
  canSubmitSurvey: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NEW: { label: "รับแจ้งใหม่", color: "bg-blue-100 text-blue-800", icon: <AlertCircle className="h-4 w-4" /> },
  IN_PROGRESS: { label: "กำลังดำเนินการ", color: "bg-yellow-100 text-yellow-800", icon: <Hourglass className="h-4 w-4" /> },
  WAITING_USER: { label: "รอข้อมูลจากผู้แจ้ง", color: "bg-orange-100 text-orange-800", icon: <Clock className="h-4 w-4" /> },
  RESOLVED: { label: "แก้ไขแล้ว", color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="h-4 w-4" /> },
  CLOSED: { label: "ปิดงาน", color: "bg-gray-100 text-gray-800", icon: <CheckCircle2 className="h-4 w-4" /> },
  REJECTED: { label: "ไม่รับดำเนินการ", color: "bg-red-100 text-red-800", icon: <XCircle className="h-4 w-4" /> },
};

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketCode: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeCode, setEmployeeCode] = useState<string>("");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);

  useEffect(() => {
    const storedCode = sessionStorage.getItem("employeeCode");
    if (!storedCode) {
      router.push(`/track?code=${resolvedParams.ticketCode}`);
      return;
    }
    setEmployeeCode(storedCode);
    loadTicket(storedCode);
  }, [resolvedParams.ticketCode, router]);

  const loadTicket = async (empCode: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tickets/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCode: resolvedParams.ticketCode,
          employeeCode: empCode,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "ไม่พบข้อมูล Ticket");
      }

      const data = await response.json();
      setTicket(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
      router.push("/track");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/tickets/${resolvedParams.ticketCode}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeCode,
          message: newComment,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "ไม่สามารถส่งข้อความได้");
      }

      toast.success("ส่งข้อความเรียบร้อยแล้ว");
      setNewComment("");
      loadTicket(employeeCode);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSubmitSurvey = async () => {
    if (rating === 0) {
      toast.error("กรุณาให้คะแนนความพึงพอใจ");
      return;
    }

    setIsSubmittingSurvey(true);
    try {
      const response = await fetch(`/api/tickets/${resolvedParams.ticketCode}/survey`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeCode,
          rating,
          feedback: feedback || undefined,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "ไม่สามารถส่งแบบประเมินได้");
      }

      toast.success("ขอบคุณสำหรับการประเมิน");
      loadTicket(employeeCode);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmittingSurvey(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400 mt-3">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const status = statusConfig[ticket.status] || statusConfig.NEW;

  // Check if survey is required (status is RESOLVED or CLOSED and no survey yet)
  const requiresSurvey = 
    (ticket.status === "RESOLVED" || ticket.status === "CLOSED") && 
    !ticket.survey && 
    ticket.canSubmitSurvey;

  // If survey is required, show full-page survey form first
  if (requiresSurvey) {
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

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-lg">
          {/* Ticket Info Badge */}
          <div className="text-center mb-6">
            <Badge className={`${status.color} text-sm px-4 py-1.5`}>
              {status.icon}
              <span className="ml-2">{ticket.ticketCode} - {status.label}</span>
            </Badge>
          </div>

          {/* Survey Card */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardContent className="p-6">
              {/* Icon & Title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl mb-4">
                  <Star className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ประเมินความพึงพอใจ
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  กรุณาให้คะแนนความพึงพอใจในการบริการก่อนดูรายละเอียด Ticket
                </p>
              </div>

              {/* Subject */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">เรื่อง</p>
                <p className="font-medium text-gray-900 dark:text-white">{ticket.subject}</p>
              </div>

              {/* Rating Stars */}
              <div className="mb-6">
                <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-4">
                  ให้คะแนนความพึงพอใจ <span className="text-red-500">*</span>
                </p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 transition-colors ${
                          star <= rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300 dark:text-gray-600 hover:text-amber-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-amber-600 dark:text-amber-400 font-medium text-sm mt-2">
                    {rating === 1 && "ต้องปรับปรุง"}
                    {rating === 2 && "พอใช้"}
                    {rating === 3 && "ปานกลาง"}
                    {rating === 4 && "ดี"}
                    {rating === 5 && "ดีมาก"}
                  </p>
                )}
              </div>

              {/* Feedback */}
              <div className="mb-6">
                <Textarea
                  placeholder="ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmitSurvey}
                disabled={isSubmittingSurvey || rating === 0}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20"
              >
                {isSubmittingSurvey ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-4 w-4" />
                    ส่งการประเมินและดูรายละเอียด
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <Link href="/track" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าติดตาม
        </Link>

        {/* Ticket Header */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <span className="font-mono">{ticket.ticketCode}</span>
                  <Badge className={`${status.color} px-3`}>
                    {status.icon}
                    <span className="ml-1">{status.label}</span>
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {ticket.subject}
                </CardDescription>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>แจ้งเมื่อ: {format(new Date(ticket.createdAt), "d MMM yyyy HH:mm", { locale: th })}</p>
                <p>อัปเดตล่าสุด: {format(new Date(ticket.updatedAt), "d MMM yyyy HH:mm", { locale: th })}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-1 h-auto">
            <TabsTrigger value="details" className="text-xs sm:text-sm py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">รายละเอียด</TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs sm:text-sm py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">ความคืบหน้า</TabsTrigger>
            <TabsTrigger value="comments" className="text-xs sm:text-sm py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">การสื่อสาร</TabsTrigger>
            <TabsTrigger value="survey" className="text-xs sm:text-sm py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">ประเมิน</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="pt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      ข้อมูลผู้แจ้ง
                    </h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex">
                        <dt className="w-24 text-gray-500">ชื่อ:</dt>
                        <dd>{ticket.fullName}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-24 text-gray-500">รหัส:</dt>
                        <dd>{ticket.employeeCodeMasked}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-24 text-gray-500">สำนัก/ฝ่าย:</dt>
                        <dd>{ticket.bureau}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-24 text-gray-500">กอง:</dt>
                        <dd>{ticket.division}</dd>
                      </div>
                      <div className="flex">
                        <dt className="w-24 text-gray-500">แผนก/งาน:</dt>
                        <dd>{ticket.department}</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      รายละเอียดปัญหา
                    </h4>
                    <dl className="space-y-2 text-sm">
                      {ticket.system && (
                        <div className="flex">
                          <dt className="w-24 text-gray-500">ระบบ:</dt>
                          <dd>{ticket.system}</dd>
                        </div>
                      )}
                      {ticket.category && (
                        <div className="flex">
                          <dt className="w-24 text-gray-500">หมวดหมู่:</dt>
                          <dd>{ticket.category}</dd>
                        </div>
                      )}
                      {ticket.priority && (
                        <div className="flex">
                          <dt className="w-24 text-gray-500">ความเร่งด่วน:</dt>
                          <dd>{ticket.priority}</dd>
                        </div>
                      )}
                      {ticket.assignee && (
                        <div className="flex">
                          <dt className="w-24 text-gray-500">ผู้รับผิดชอบ:</dt>
                          <dd>{ticket.assignee}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">รายละเอียด</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {ticket.statusLogs.map((log, index) => (
                    <div key={log.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === ticket.statusLogs.length - 1 ? "bg-blue-600" : "bg-gray-300"
                        }`} />
                        {index < ticket.statusLogs.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={statusConfig[log.toStatus]?.color}>
                            {statusConfig[log.toStatus]?.label || log.toStatus}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(new Date(log.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-sm text-gray-600 mt-1">{log.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="pt-6 space-y-4">
                {ticket.comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">ยังไม่มีข้อความ</p>
                ) : (
                  <div className="space-y-4">
                    {ticket.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-2xl ${
                          comment.authorType === "USER"
                            ? "bg-blue-50 dark:bg-blue-950/30 ml-8"
                            : "bg-gray-50 dark:bg-gray-800/50 mr-8"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-sm">
                            {comment.authorName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comment.createdAt), "d MMM yyyy HH:mm", { locale: th })}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {ticket.status !== "CLOSED" && ticket.status !== "REJECTED" && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Textarea
                        placeholder="พิมพ์ข้อความเพิ่มเติม..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button
                        onClick={handleSubmitComment}
                        disabled={isSubmittingComment || !newComment.trim()}
                      >
                        {isSubmittingComment ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        ส่งข้อความ
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Survey Tab */}
          <TabsContent value="survey">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="pt-6">
                {ticket.survey ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">ขอบคุณสำหรับการประเมิน</h3>
                    <div className="flex justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 ${
                            star <= ticket.survey!.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {ticket.survey.feedback && (
                      <p className="text-gray-600 italic">&quot;{ticket.survey.feedback}&quot;</p>
                    )}
                  </div>
                ) : ticket.canSubmitSurvey ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">ประเมินความพึงพอใจ</h3>
                      <p className="text-gray-600">
                        กรุณาให้คะแนนการบริการของเจ้าหน้าที่
                      </p>
                    </div>

                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-10 w-10 ${
                              star <= rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 hover:text-yellow-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="max-w-md mx-auto">
                      <Textarea
                        placeholder="ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={handleSubmitSurvey}
                        disabled={isSubmittingSurvey || rating === 0}
                        size="lg"
                      >
                        {isSubmittingSurvey ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="mr-2 h-4 w-4" />
                        )}
                        ส่งการประเมิน
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-600">ยังไม่สามารถประเมินได้</h3>
                    <p className="text-gray-500">
                      คุณสามารถประเมินความพึงพอใจได้เมื่อสถานะเป็น &quot;แก้ไขแล้ว&quot; หรือ &quot;ปิดงาน&quot;
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
