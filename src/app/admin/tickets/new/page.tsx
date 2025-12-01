"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, User, Building2, AlertCircle, Send, Ticket } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema สำหรับ Admin สร้าง Ticket
const adminCreateTicketSchema = z.object({
  employeeCode: z
    .string()
    .length(7, "รหัสพนักงานต้องเป็นตัวเลข 7 หลัก")
    .regex(/^[0-9]{7}$/, "รหัสพนักงานต้องเป็นตัวเลข 7 หลักเท่านั้น"),
  fullName: z
    .string()
    .min(2, "ชื่อ-สกุลต้องมีอย่างน้อย 2 ตัวอักษร")
    .max(120, "ชื่อ-สกุลต้องไม่เกิน 120 ตัวอักษร"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  phone: z.string().regex(/^[0-9]{9,10}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก").optional().or(z.literal("")),
  bureau: z.string().min(1, "กรุณาระบุสำนัก/ฝ่าย"),
  division: z.string().min(1, "กรุณาระบุกอง"),
  department: z.string().min(1, "กรุณาระบุแผนก/งาน"),
  categoryId: z.string().optional(),
  priorityId: z.string().optional(),
  systemId: z.string().optional(),
  subject: z.string().min(5, "หัวข้อปัญหาต้องมีอย่างน้อย 5 ตัวอักษร").max(150, "หัวข้อปัญหาต้องไม่เกิน 150 ตัวอักษร"),
  description: z.string().min(10, "รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร").max(4000, "รายละเอียดต้องไม่เกิน 4000 ตัวอักษร"),
  assigneeId: z.string().optional(),
  teamId: z.string().optional(),
});

type AdminCreateTicketInput = z.infer<typeof adminCreateTicketSchema>;

interface OrgUnit {
  id: string;
  code: string | null;
  name: string;
  type: string;
  parentId: string | null;
}

interface MasterData {
  categories: { id: string; code: string; name: string }[];
  priorities: { id: string; code: string; name: string; severity: number }[];
  systems: { id: string; code: string; name: string }[];
}

interface StaffUser {
  id: string;
  displayName: string;
  email: string;
}

interface Team {
  id: string;
  name: string;
}

export default function AdminNewTicketPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bureaus, setBureaus] = useState<OrgUnit[]>([]);
  const [divisions, setDivisions] = useState<OrgUnit[]>([]);
  const [departments, setDepartments] = useState<OrgUnit[]>([]);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedBureauId, setSelectedBureauId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");

  const form = useForm<AdminCreateTicketInput>({
    resolver: zodResolver(adminCreateTicketSchema),
    defaultValues: {
      employeeCode: "",
      fullName: "",
      email: "",
      phone: "",
      bureau: "",
      division: "",
      department: "",
      subject: "",
      description: "",
    },
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bureausRes, masterDataRes, staffRes, teamsRes] = await Promise.all([
          fetch("/api/public/org-units?type=BUREAU"),
          fetch("/api/public/master-data"),
          fetch("/api/admin/staff"),
          fetch("/api/admin/teams"),
        ]);

        if (bureausRes.ok) {
          const bureausData = await bureausRes.json();
          setBureaus(bureausData);
        }

        if (masterDataRes.ok) {
          const masterDataData = await masterDataRes.json();
          setMasterData(masterDataData);
        }

        if (staffRes.ok) {
          const staffData = await staffRes.json();
          setStaffUsers(staffData.data || staffData);
        }

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData.data || teamsData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Load divisions when bureau changes
  useEffect(() => {
    if (selectedBureauId) {
      fetch(`/api/public/org-units?type=DIVISION&parentId=${selectedBureauId}`)
        .then((res) => res.json())
        .then((data) => setDivisions(data))
        .catch(console.error);
    } else {
      setDivisions([]);
    }
    setSelectedDivisionId("");
    setDepartments([]);
  }, [selectedBureauId]);

  // Load departments when division changes
  useEffect(() => {
    if (selectedDivisionId) {
      fetch(`/api/public/org-units?type=DEPARTMENT&parentId=${selectedDivisionId}`)
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch(console.error);
    } else {
      setDepartments([]);
    }
  }, [selectedDivisionId]);

  const onSubmit = async (data: AdminCreateTicketInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/tickets/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }

      toast.success(`สร้าง Ticket สำเร็จ: ${result.ticketCode}`);
      router.push(`/admin/tickets/${result.ticketId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/tickets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              สร้าง Ticket ใหม่
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              สร้างรายการแจ้งปัญหาแทนผู้ใช้งาน
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>ข้อมูล Ticket</CardTitle>
          <CardDescription>
            กรอกข้อมูลให้ครบถ้วนเพื่อสร้างรายการแจ้งปัญหา
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: ข้อมูลผู้แจ้ง */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold">ข้อมูลผู้แจ้ง</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>รหัสพนักงาน * (ตัวเลข 7 หลัก)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="เช่น 1234567"
                            maxLength={7}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 7);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ชื่อ-สกุล *</FormLabel>
                        <FormControl>
                          <Input placeholder="ชื่อจริง นามสกุล" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>อีเมล</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>เบอร์โทรศัพท์</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="0812345678"
                            maxLength={10}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bureau"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>สำนัก/ฝ่าย *</FormLabel>
                        <Select
                          value={selectedBureauId}
                          onValueChange={(value) => {
                            setSelectedBureauId(value);
                            const bureau = bureaus.find((b) => b.id === value);
                            field.onChange(bureau?.name || "");
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกสำนัก/ฝ่าย" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bureaus.map((bureau) => (
                              <SelectItem key={bureau.id} value={bureau.id}>
                                {bureau.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>กอง *</FormLabel>
                        <Select
                          value={selectedDivisionId}
                          onValueChange={(value) => {
                            setSelectedDivisionId(value);
                            const division = divisions.find((d) => d.id === value);
                            field.onChange(division?.name || "");
                          }}
                          disabled={!selectedBureauId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกกอง" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {divisions.map((division) => (
                              <SelectItem key={division.id} value={division.id}>
                                {division.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>แผนก/งาน *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            const department = departments.find((d) => d.id === value);
                            field.onChange(department?.name || value);
                          }}
                          disabled={!selectedDivisionId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกแผนก/งาน" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department.id} value={department.id}>
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Section 2: รายละเอียดปัญหา */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold">รายละเอียดปัญหา</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>หมวดหมู่</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกหมวดหมู่" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {masterData?.categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priorityId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ความสำคัญ</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกความสำคัญ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {masterData?.priorities.map((pri) => (
                              <SelectItem key={pri.id} value={pri.id}>
                                {pri.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="systemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ระบบที่เกี่ยวข้อง</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกระบบ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {masterData?.systems.map((sys) => (
                              <SelectItem key={sys.id} value={sys.id}>
                                {sys.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หัวข้อปัญหา *</FormLabel>
                      <FormControl>
                        <Input placeholder="ระบุหัวข้อปัญหาโดยสังเขป" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>รายละเอียด *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="อธิบายปัญหาที่พบโดยละเอียด..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section 3: การมอบหมาย */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold">การมอบหมาย (ไม่บังคับ)</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="teamId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ทีมรับผิดชอบ</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกทีม (หรือปล่อยว่างให้ระบบเลือกอัตโนมัติ)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assigneeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ผู้รับผิดชอบ</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {staffUsers.map((staff) => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.displayName} ({staff.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Link href="/admin/tickets">
                  <Button type="button" variant="outline">
                    ยกเลิก
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      กำลังสร้าง...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      สร้าง Ticket
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
