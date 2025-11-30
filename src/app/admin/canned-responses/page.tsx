"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  MessageSquareText,
  ToggleLeft,
  ToggleRight,
  Copy
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

interface CannedResponse {
  id: string;
  title: string;
  body: string;
  categoryId: string | null;
  isActive: boolean;
  sortOrder: number;
  category: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function CannedResponsesPage() {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponse, setEditingResponse] = useState<CannedResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    categoryId: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [responsesRes, masterDataRes] = await Promise.all([
        fetch("/api/admin/canned-responses"),
        fetch("/api/public/master-data"),
      ]);

      if (responsesRes.ok) {
        setResponses(await responsesRes.json());
      }
      if (masterDataRes.ok) {
        const data = await masterDataRes.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDialog = (response?: CannedResponse) => {
    if (response) {
      setEditingResponse(response);
      setFormData({
        title: response.title,
        body: response.body,
        categoryId: response.categoryId || "",
        isActive: response.isActive,
        sortOrder: response.sortOrder,
      });
    } else {
      setEditingResponse(null);
      setFormData({
        title: "",
        body: "",
        categoryId: "",
        isActive: true,
        sortOrder: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.body) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setIsSaving(true);
    try {
      const url = editingResponse
        ? `/api/admin/canned-responses/${editingResponse.id}`
        : "/api/admin/canned-responses";
      const method = editingResponse ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      toast.success(editingResponse ? "อัปเดตเรียบร้อย" : "สร้างเรียบร้อย");
      setIsDialogOpen(false);
      loadData();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ยืนยันการลบข้อความนี้?")) return;

    try {
      const response = await fetch(`/api/admin/canned-responses/${id}`, {
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

  const toggleActive = async (item: CannedResponse) => {
    try {
      const response = await fetch(`/api/admin/canned-responses/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, isActive: !item.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      loadData();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("คัดลอกแล้ว");
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
          <div className="p-2.5 bg-teal-600 rounded-xl shadow-lg shadow-teal-600/25">
            <MessageSquareText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              ข้อความสำเร็จรูป
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ข้อความตอบกลับสำหรับ Staff
            </p>
          </div>
        </div>
        <Button onClick={() => openDialog()} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มข้อความ
        </Button>
      </div>

      {/* Help */}
      <PageHelp items={pageHelpConfig["admin-canned-responses"]} />

      {/* Cards */}
      {responses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            ยังไม่มีข้อความสำเร็จรูป
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {responses.map((item) => (
            <Card key={item.id} className={!item.isActive ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.body)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {item.body}
                </p>
                <div className="flex items-center justify-between">
                  {item.category ? (
                    <Badge variant="outline" className="text-xs">
                      {item.category.name}
                    </Badge>
                  ) : (
                    <span />
                  )}
                  <button onClick={() => toggleActive(item)}>
                    {item.isActive ? (
                      <Badge className="bg-green-100 text-green-800 cursor-pointer text-xs">
                        <ToggleRight className="h-3 w-3 mr-1" />
                        เปิด
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 cursor-pointer text-xs">
                        <ToggleLeft className="h-3 w-3 mr-1" />
                        ปิด
                      </Badge>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingResponse ? "แก้ไขข้อความ" : "เพิ่มข้อความใหม่"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ชื่อ/หัวข้อ *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="เช่น ขอบคุณที่แจ้งปัญหา"
              />
            </div>

            <div className="space-y-2">
              <Label>เนื้อหา *</Label>
              <Textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="ข้อความที่ต้องการใช้ตอบกลับ"
                className="min-h-[150px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingResponse ? "บันทึก" : "สร้าง"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
