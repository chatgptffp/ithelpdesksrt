"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ChevronRight, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrgUnit {
  id: string;
  code: string | null;
  name: string;
  type: "BUREAU" | "DIVISION" | "DEPARTMENT";
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  children?: OrgUnit[];
}

const typeLabels: Record<string, string> = {
  BUREAU: "สำนัก/ฝ่าย",
  DIVISION: "กอง",
  DEPARTMENT: "แผนก/งาน",
};

export default function OrgUnitsPage() {
  const [items, setItems] = useState<OrgUnit[]>([]);
  const [flatItems, setFlatItems] = useState<OrgUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OrgUnit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "BUREAU" as "BUREAU" | "DIVISION" | "DEPARTMENT",
    parentId: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/master-data/org-units");
      if (response.ok) {
        const data = await response.json();
        setItems(data.tree);
        setFlatItems(data.flat);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const openCreateDialog = (type: "BUREAU" | "DIVISION" | "DEPARTMENT", parentId?: string) => {
    setEditingItem(null);
    setFormData({
      code: "",
      name: "",
      type,
      parentId: parentId || "",
      isActive: true,
      sortOrder: 0,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: OrgUnit) => {
    setEditingItem(item);
    setFormData({
      code: item.code || "",
      name: item.name,
      type: item.type,
      parentId: item.parentId || "",
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("กรุณากรอกชื่อ");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/master-data/org-units/${editingItem.id}`
        : "/api/admin/master-data/org-units";
      
      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null,
        }),
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
    if (!confirm("ต้องการลบรายการนี้หรือไม่? (รวมถึงหน่วยงานย่อยทั้งหมด)")) return;

    try {
      const response = await fetch(`/api/admin/master-data/org-units/${id}`, {
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

  const renderOrgUnit = (unit: OrgUnit, level: number = 0) => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = expandedIds.has(unit.id);

    return (
      <div key={unit.id}>
        <div
          className={`flex items-center gap-2 p-3 hover:bg-gray-50 border-b ${
            level > 0 ? "ml-" + (level * 6) : ""
          }`}
          style={{ marginLeft: level * 24 }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(unit.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            </button>
          ) : (
            <div className="w-6" />
          )}

          <Building2 className="h-4 w-4 text-gray-400" />

          <div className="flex-1">
            <span className="font-medium">{unit.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              ({typeLabels[unit.type]})
            </span>
            {unit.code && (
              <span className="text-xs text-gray-400 ml-2 font-mono">
                [{unit.code}]
              </span>
            )}
          </div>

          <span className={`px-2 py-0.5 rounded-full text-xs ${
            unit.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
          }`}>
            {unit.isActive ? "ใช้งาน" : "ปิด"}
          </span>

          <div className="flex gap-1">
            {unit.type !== "DEPARTMENT" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  openCreateDialog(
                    unit.type === "BUREAU" ? "DIVISION" : "DEPARTMENT",
                    unit.id
                  )
                }
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => openEditDialog(unit)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(unit.id)}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {unit.children!.map((child) => renderOrgUnit(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const parentOptions = flatItems.filter((item) => {
    if (formData.type === "BUREAU") return false;
    if (formData.type === "DIVISION") return item.type === "BUREAU";
    if (formData.type === "DEPARTMENT") return item.type === "DIVISION";
    return false;
  });

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการหน่วยงาน</h1>
          <p className="text-gray-600 dark:text-gray-400">จัดการโครงสร้างหน่วยงาน (สำนัก/ฝ่าย → กอง → แผนก/งาน)</p>
        </div>
        <Button onClick={() => openCreateDialog("BUREAU")} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มสำนัก/ฝ่าย
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              ไม่มีข้อมูล
            </div>
          ) : (
            items.map((unit) => renderOrgUnit(unit))
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "แก้ไข" : "เพิ่ม"}{typeLabels[formData.type]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ประเภท</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as typeof formData.type, parentId: "" })}
                disabled={!!editingItem}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUREAU">สำนัก/ฝ่าย</SelectItem>
                  <SelectItem value="DIVISION">กอง</SelectItem>
                  <SelectItem value="DEPARTMENT">แผนก/งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type !== "BUREAU" && (
              <div className="space-y-2">
                <Label>สังกัด</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(v) => setFormData({ ...formData, parentId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหน่วยงานต้นสังกัด" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>รหัส (ไม่บังคับ)</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="B-XXX"
              />
            </div>
            <div className="space-y-2">
              <Label>ชื่อหน่วยงาน</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อหน่วยงาน"
              />
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
