"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  FolderTree,
  ArrowLeft
} from "lucide-react";
import { showSuccess, showError, confirmDelete } from "@/lib/swal";
import { useLanguage } from "@/lib/i18n";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: {
    articles: number;
  };
}

export default function KbCategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    icon: "",
    color: "#10b981",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/kb/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch {
      showError(t.messages.error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      icon: "",
      color: "#10b981",
      isActive: true,
      sortOrder: categories.length + 1,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: Category) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || "",
      icon: item.icon || "",
      color: item.color || "#10b981",
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      showError(t.messages.fillRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/kb/categories/${editingItem.id}`
        : "/api/admin/kb/categories";

      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || t.messages.error);
      }

      showSuccess(t.messages.saveSuccess);
      setDialogOpen(false);
      loadData();
    } catch (error) {
      showError(error instanceof Error ? error.message : t.messages.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirmDelete(name);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/kb/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || t.messages.error);
      }

      showSuccess(t.messages.deleteSuccess);
      loadData();
    } catch (error) {
      showError(error instanceof Error ? error.message : t.messages.error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/knowledge-base">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/25">
            <FolderTree className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">หมวดหมู่บทความ</h1>
            <p className="text-gray-500 dark:text-gray-400">จัดการหมวดหมู่สำหรับ Knowledge Base</p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มหมวดหมู่
        </Button>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-gray-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-800">
                <TableHead className="w-[80px]">{t.common.sortOrder}</TableHead>
                <TableHead>{t.common.code}</TableHead>
                <TableHead>{t.common.name}</TableHead>
                <TableHead>สี</TableHead>
                <TableHead className="text-center">บทความ</TableHead>
                <TableHead className="w-[100px]">{t.common.status}</TableHead>
                <TableHead className="w-[120px]">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t.common.noData}
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="dark:border-gray-800">
                    <TableCell>{cat.sortOrder}</TableCell>
                    <TableCell className="font-mono">{cat.code}</TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <div 
                        className="w-6 h-6 rounded-lg" 
                        style={{ backgroundColor: cat.color || "#10b981" }}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{cat._count.articles}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        cat.isActive 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {cat.isActive ? t.common.active : t.common.inactive}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(cat)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id, cat.name)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}</DialogTitle>
            <DialogDescription>
              {editingItem ? "แก้ไขข้อมูลหมวดหมู่บทความ" : "กรอกข้อมูลเพื่อสร้างหมวดหมู่ใหม่"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>รหัส *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="KB-HOW-TO"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>ลำดับ</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ชื่อหมวดหมู่ *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="วิธีแก้ปัญหา"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>คำอธิบาย</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดหมวดหมู่"
                className="rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon (Lucide)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="book-open"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>สี</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-14 h-10 p-1 rounded-lg"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>{t.common.active}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? t.common.save : t.common.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
