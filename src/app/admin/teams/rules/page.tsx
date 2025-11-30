"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AssignmentRule {
  id: string;
  teamId: string;
  systemId: string | null;
  categoryId: string | null;
  priority: number;
  isActive: boolean;
  team: { name: string };
  system: { name: string } | null;
  category: { name: string } | null;
}

interface Team {
  id: string;
  name: string;
}

interface MdItem {
  id: string;
  name: string;
}

export default function AssignmentRulesPage() {
  const [rules, setRules] = useState<AssignmentRule[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [systems, setSystems] = useState<MdItem[]>([]);
  const [categories, setCategories] = useState<MdItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AssignmentRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    teamId: "",
    systemId: "",
    categoryId: "",
    priority: 0,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rulesRes, teamsRes, systemsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/assignment-rules"),
        fetch("/api/admin/teams"),
        fetch("/api/admin/master-data/systems"),
        fetch("/api/admin/master-data/categories"),
      ]);

      if (rulesRes.ok) setRules(await rulesRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (systemsRes.ok) setSystems(await systemsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData({
      teamId: "",
      systemId: "",
      categoryId: "",
      priority: 0,
      isActive: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: AssignmentRule) => {
    setEditingItem(item);
    setFormData({
      teamId: item.teamId,
      systemId: item.systemId || "",
      categoryId: item.categoryId || "",
      priority: item.priority,
      isActive: item.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.teamId) {
      toast.error("กรุณาเลือกทีม");
      return;
    }
    if (!formData.systemId && !formData.categoryId) {
      toast.error("กรุณาเลือกระบบหรือหมวดหมู่อย่างน้อยหนึ่งอย่าง");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingItem
        ? `/api/admin/assignment-rules/${editingItem.id}`
        : "/api/admin/assignment-rules";

      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          systemId: formData.systemId || null,
          categoryId: formData.categoryId || null,
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
    if (!confirm("ต้องการลบกฎนี้หรือไม่?")) return;

    try {
      const response = await fetch(`/api/admin/assignment-rules/${id}`, {
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
    <div className="p-8">
      <Link href="/admin/teams" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        กลับรายการทีม
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">กฎการมอบหมายงาน</h1>
          <p className="text-gray-600">กำหนดว่าระบบ/หมวดหมู่ไหนให้ทีมไหนรับผิดชอบ</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มกฎ
        </Button>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          เมื่อมีการสร้าง Ticket ใหม่ ระบบจะหาทีมที่รับผิดชอบตามกฎที่กำหนด 
          โดยจะเลือกกฎที่มี <strong>priority สูงสุด</strong> และ match กับระบบ/หมวดหมู่ของ Ticket
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ทีมรับผิดชอบ</TableHead>
                <TableHead>ระบบ</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-center">Priority</TableHead>
                <TableHead className="w-[100px]">สถานะ</TableHead>
                <TableHead className="w-[120px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    ยังไม่มีกฎการมอบหมาย
                  </TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.team.name}</TableCell>
                    <TableCell>{rule.system?.name || <span className="text-gray-400">ทุกระบบ</span>}</TableCell>
                    <TableCell>{rule.category?.name || <span className="text-gray-400">ทุกหมวดหมู่</span>}</TableCell>
                    <TableCell className="text-center font-mono">{rule.priority}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        rule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                      }`}>
                        {rule.isActive ? "ใช้งาน" : "ปิด"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(rule)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)}>
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
            <DialogTitle>{editingItem ? "แก้ไขกฎ" : "เพิ่มกฎการมอบหมาย"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>ทีมรับผิดชอบ *</Label>
              <Select value={formData.teamId} onValueChange={(v) => setFormData({ ...formData, teamId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกทีม" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>ระบบ (ไม่เลือก = ทุกระบบ)</Label>
              <Select 
                value={formData.systemId} 
                onValueChange={(v) => setFormData({ ...formData, systemId: v === "_all" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทุกระบบ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">ทุกระบบ</SelectItem>
                  {systems.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>หมวดหมู่ (ไม่เลือก = ทุกหมวดหมู่)</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(v) => setFormData({ ...formData, categoryId: v === "_all" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทุกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">ทุกหมวดหมู่</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority (ยิ่งสูงยิ่งมีความสำคัญ)</Label>
              <Input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
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
