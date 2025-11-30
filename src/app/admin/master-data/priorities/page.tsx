"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Priority {
  id: string;
  code: string;
  name: string;
  severity: number;
  slaFirstResponseMins: number | null;
  slaResolveMins: number | null;
  isActive: boolean;
  sortOrder: number;
}

export default function PrioritiesPage() {
  const [items, setItems] = useState<Priority[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Priority | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    severity: 3,
    slaFirstResponseMins: 480,
    slaResolveMins: 1440,
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/master-data/priorities");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      code: "",
      name: "",
      severity: 3,
      slaFirstResponseMins: 480,
      slaResolveMins: 1440,
      isActive: true,
      sortOrder: items.length + 1,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: Priority) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      severity: item.severity,
      slaFirstResponseMins: item.slaFirstResponseMins || 480,
      slaResolveMins: item.slaResolveMins || 1440,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/master-data/priorities/${editingItem.id}`
        : "/api/admin/master-data/priorities";
      
      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }

      toast.success(editingItem ? "แก้ไขเรียบร้อยแล้ว" : "เพิ่มเรียบร้อยแล้ว");
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบรายการนี้หรือไม่?")) return;

    try {
      const response = await fetch(`/api/admin/master-data/priorities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }

      toast.success("ลบเรียบร้อยแล้ว");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการความเร่งด่วน</h1>
          <p className="text-gray-600 dark:text-gray-400">จัดการระดับความเร่งด่วนและ SLA</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มความเร่งด่วน
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                <TableHead className="w-[80px]">ลำดับ</TableHead>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่อ</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>SLA ตอบ (นาที)</TableHead>
                <TableHead>SLA แก้ (นาที)</TableHead>
                <TableHead className="w-[100px]">สถานะ</TableHead>
                <TableHead className="w-[120px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    ไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sortOrder}</TableCell>
                    <TableCell className="font-mono">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.severity}</TableCell>
                    <TableCell>{item.slaFirstResponseMins || "-"}</TableCell>
                    <TableCell>{item.slaResolveMins || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {item.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "แก้ไขความเร่งด่วน" : "เพิ่มความเร่งด่วน"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>รหัส</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="P1"
                />
              </div>
              <div className="space-y-2">
                <Label>Severity (1=สูงสุด)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) || 3 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ชื่อ</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อความเร่งด่วน"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SLA ตอบกลับ (นาที)</Label>
                <Input
                  type="number"
                  value={formData.slaFirstResponseMins}
                  onChange={(e) => setFormData({ ...formData, slaFirstResponseMins: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>SLA แก้ไข (นาที)</Label>
                <Input
                  type="number"
                  value={formData.slaResolveMins}
                  onChange={(e) => setFormData({ ...formData, slaResolveMins: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ลำดับการแสดงผล</Label>
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>เปิดใช้งาน</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? "บันทึก" : "เพิ่ม"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
