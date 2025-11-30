"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Shield, ArrowLeft, Loader2, User, Building2, AlertCircle, Send, Paperclip, X, FileText, Image as ImageIcon, Sparkles } from "lucide-react";
import { PageHelp } from "@/components/ui/page-help";
import { pageHelpConfig } from "@/lib/page-help-config";

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

import { createTicketSchema, type CreateTicketInput } from "@/lib/validations/ticket";

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

interface Template {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  body: string;
  categoryId: string | null;
  priorityId: string | null;
  systemId: string | null;
}

interface UploadedFile {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
}

export default function ReportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [bureaus, setBureaus] = useState<OrgUnit[]>([]);
  const [divisions, setDivisions] = useState<OrgUnit[]>([]);
  const [departments, setDepartments] = useState<OrgUnit[]>([]);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [selectedBureauId, setSelectedBureauId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      employeeCode: "",
      fullName: "",
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
        const [bureausRes, masterDataRes, templatesRes] = await Promise.all([
          fetch("/api/public/org-units?type=BUREAU"),
          fetch("/api/public/master-data"),
          fetch("/api/public/templates"),
        ]);
        
        if (bureausRes.ok) {
          const data = await bureausRes.json();
          setBureaus(data);
        }
        
        if (masterDataRes.ok) {
          const data = await masterDataRes.json();
          setMasterData(data);
        }

        if (templatesRes.ok) {
          const data = await templatesRes.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const applyTemplate = (template: Template) => {
    form.setValue("subject", template.subject);
    form.setValue("description", template.body);
    if (template.categoryId) {
      form.setValue("categoryId", template.categoryId);
    }
    if (template.priorityId) {
      form.setValue("priorityId", template.priorityId);
    }
    if (template.systemId) {
      form.setValue("systemId", template.systemId);
    }
    toast.success(`ใช้ Template: ${template.name}`);
  };

  // Load divisions when bureau changes
  useEffect(() => {
    if (selectedBureauId) {
      fetch(`/api/public/org-units?type=DIVISION&parentId=${selectedBureauId}`)
        .then((res) => res.json())
        .then((data) => setDivisions(data))
        .catch(console.error);
    } else {
      setDivisions([]);
      setDepartments([]);
    }
    setSelectedDivisionId("");
    form.setValue("division", "");
    form.setValue("department", "");
  }, [selectedBureauId, form]);

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
    form.setValue("department", "");
  }, [selectedDivisionId, form]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 5) {
      toast.error("อัปโหลดได้สูงสุด 5 ไฟล์");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/public/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถอัปโหลดไฟล์ได้");
      }

      setAttachments((prev) => [...prev, ...result.files]);
      toast.success(`อัปโหลดสำเร็จ ${result.files.length} ไฟล์`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const onSubmit = async (data: CreateTicketInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          attachments: attachments,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
      }

      // Redirect to success page
      router.push(`/report/success?ticketCode=${result.ticketCode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">IT Helpdesk</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">การรถไฟแห่งประเทศไทย</p>
            </div>
          </Link>
          <Link href="/track">
            <Button variant="outline" size="sm">
              ติดตามงาน
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าหลัก
        </Link>

        {/* Help */}
        <PageHelp items={pageHelpConfig["public-report"]} />

        {/* Templates */}
        {templates.length > 0 && (
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                เลือกจาก Template
              </CardTitle>
              <CardDescription>
                คลิกเพื่อกรอกข้อมูลอัตโนมัติ
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700"
                  >
                    <FileText className="h-3 w-3 mr-1.5" />
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-2xl">แจ้งปัญหาการใช้งาน</CardTitle>
            <CardDescription>
              กรุณากรอกข้อมูลให้ครบถ้วน เพื่อให้เจ้าหน้าที่สามารถช่วยเหลือได้รวดเร็ว
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1: ข้อมูลผู้แจ้ง */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ข้อมูลผู้แจ้ง</h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employeeCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>รหัสพนักงาน *</FormLabel>
                          <FormControl>
                            <Input placeholder="เช่น EMP-000123" {...field} />
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
                              const dept = departments.find((d) => d.name === value);
                              field.onChange(value);
                              if (dept) {
                                form.setValue("orgUnitId", dept.id);
                              }
                            }}
                            disabled={!selectedDivisionId}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="เลือกแผนก/งาน" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.name}>
                                  {dept.name}
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
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">รายละเอียดปัญหา</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="systemId"
                      render={({ field }) => (
                        <FormItem className="min-w-0 overflow-hidden">
                          <FormLabel>ระบบที่มีปัญหา</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full overflow-hidden">
                                <span className="truncate block">
                                  <SelectValue placeholder="เลือกระบบ" />
                                </span>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {masterData?.systems.map((system) => (
                                <SelectItem key={system.id} value={system.id}>
                                  {system.name}
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
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="min-w-0 overflow-hidden">
                          <FormLabel>หมวดหมู่ปัญหา</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full overflow-hidden">
                                <span className="truncate block">
                                  <SelectValue placeholder="เลือกหมวดหมู่" />
                                </span>
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
                        <FormItem className="min-w-0 overflow-hidden">
                          <FormLabel>ความเร่งด่วน</FormLabel>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full overflow-hidden">
                                <span className="truncate block">
                                  <SelectValue placeholder="เลือกความเร่งด่วน" />
                                </span>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {masterData?.priorities.map((priority) => (
                                <SelectItem key={priority.id} value={priority.id}>
                                  {priority.name}
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
                          <Input placeholder="ระบุหัวข้อปัญหาโดยย่อ" {...field} />
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
                            placeholder="อธิบายปัญหาที่พบอย่างละเอียด เช่น อาการที่เกิด ขั้นตอนที่ทำ ข้อความ error ที่แสดง"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Attachments */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ไฟล์แนบ (ไม่บังคับ)
                      </label>
                      <span className="text-xs text-gray-500">{attachments.length}/5 ไฟล์</span>
                    </div>
                    
                    {/* Upload Area */}
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={handleFileUpload}
                        disabled={isUploading || attachments.length >= 5}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        isUploading ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : 
                        attachments.length >= 5 ? "border-gray-200 bg-gray-50 dark:bg-gray-800" :
                        "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                      }`}>
                        {isUploading ? (
                          <div className="flex items-center justify-center gap-2 text-blue-600">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>กำลังอัปโหลด...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Paperclip className="h-6 w-6 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              คลิกหรือลากไฟล์มาวาง
                            </span>
                            <span className="text-xs text-gray-400">
                              รูปภาพ, PDF, Word, Excel (สูงสุด 10MB/ไฟล์)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Uploaded Files List */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                                {getFileIcon(file.mimeType)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                  {file.fileName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.sizeBytes)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <Link href="/">
                    <Button type="button" variant="outline" className="w-full sm:w-auto">
                      ยกเลิก
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กำลังส่ง...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        ส่งเรื่อง
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
