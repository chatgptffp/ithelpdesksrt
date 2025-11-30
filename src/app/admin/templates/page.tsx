"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  FileText,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { PageHelp } from "@/components/ui/page-help";
import { pageHelpConfig } from "@/lib/page-help-config";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface Template {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  body: string;
  categoryId: string | null;
  priorityId: string | null;
  systemId: string | null;
  isActive: boolean;
  sortOrder: number;
  category: { id: string; name: string } | null;
  priority: { id: string; name: string } | null;
  system: { id: string; name: string } | null;
}

interface MasterData {
  categories: { id: string; name: string }[];
  priorities: { id: string; name: string }[];
  systems: { id: string; name: string }[];
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject: "",
    body: "",
    categoryId: "",
    priorityId: "",
    systemId: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesRes, masterDataRes] = await Promise.all([
        fetch("/api/admin/templates"),
        fetch("/api/public/master-data"),
      ]);

      if (templatesRes.ok) {
        setTemplates(await templatesRes.json());
      }
      if (masterDataRes.ok) {
        setMasterData(await masterDataRes.json());
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || "",
        subject: template.subject,
        body: template.body,
        categoryId: template.categoryId || "",
        priorityId: template.priorityId || "",
        systemId: template.systemId || "",
        isActive: template.isActive,
        sortOrder: template.sortOrder,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        description: "",
        subject: "",
        body: "",
        categoryId: "",
        priorityId: "",
        systemId: "",
        isActive: true,
        sortOrder: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.body) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingTemplate
        ? `/api/admin/templates/${editingTemplate.id}`
        : "/api/admin/templates";
      const method = editingTemplate ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      toast.success(editingTemplate ? "อัปเดตเรียบร้อย" : "สร้างเรียบร้อย");
      setIsDialogOpen(false);
      loadData();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบ Template นี้?")) return;

    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("ลบเรียบร้อย");
      loadData();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const toggleActive = async (template: Template) => {
    try {
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...template, isActive: !template.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      loadData();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/25">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Template ปัญหา
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              แบบฟอร์มสำเร็จรูปสำหรับแจ้งปัญหา
            </p>
          </div>
        </div>
        <Button onClick={() => openDialog()} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่ม Template
        </Button>
      </div>

      {/* Help */}
      <PageHelp items={pageHelpConfig["admin-templates"]} />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายการ Template ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {templates.length === 0 ? (
            <p className="text-center text-gray-500 py-8">ยังไม่มี Template</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>หัวข้อ</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {template.subject}
                    </TableCell>
                    <TableCell>
                      {template.category?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <button onClick={() => toggleActive(template)}>
                        {template.isActive ? (
                          <Badge className="bg-green-100 text-green-800 cursor-pointer">
                            <ToggleRight className="h-3 w-3 mr-1" />
                            เปิดใช้งาน
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600 cursor-pointer">
                            <ToggleLeft className="h-3 w-3 mr-1" />
                            ปิดใช้งาน
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "แก้ไข Template" : "เพิ่ม Template ใหม่"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อ Template *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น ลืมรหัสผ่าน"
                />
              </div>
              <div className="space-y-2">
                <Label>ลำดับ</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>คำอธิบาย</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="คำอธิบายสั้นๆ"
              />
            </div>

            <div className="space-y-2">
              <Label>หัวข้อปัญหา *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="หัวข้อที่จะแสดงในฟอร์ม"
              />
            </div>

            <div className="space-y-2">
              <Label>รายละเอียด *</Label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="รายละเอียดที่จะแสดงในฟอร์ม"
                className="min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <Select
                  value={formData.categoryId || "none"}
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่ระบุ</SelectItem>
                    {masterData?.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ความเร่งด่วน</Label>
                <Select
                  value={formData.priorityId || "none"}
                  onValueChange={(v) => setFormData({ ...formData, priorityId: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่ระบุ</SelectItem>
                    {masterData?.priorities.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ระบบ</Label>
                <Select
                  value={formData.systemId || "none"}
                  onValueChange={(v) => setFormData({ ...formData, systemId: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่ระบุ</SelectItem>
                    {masterData?.systems.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingTemplate ? "บันทึก" : "สร้าง"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
