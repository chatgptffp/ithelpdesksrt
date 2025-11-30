"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Key } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface StaffUser {
  id: string;
  email: string;
  displayName: string;
  status: string;
  staffRoles: Array<{ role: { code: string; name: string } }>;
  staffTeams: Array<{ team: { name: string }; isLeader: boolean }>;
  createdAt: string;
}

interface Role {
  id: string;
  code: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    password: "",
    roleId: "",
    status: "ACTIVE",
  });

  const [newPassword, setNewPassword] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/roles"),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      displayName: "",
      password: "",
      roleId: roles[0]?.id || "",
      status: "ACTIVE",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (user: StaffUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      displayName: user.displayName,
      password: "",
      roleId: user.staffRoles[0]?.role?.code === "ADMIN" 
        ? roles.find(r => r.code === "ADMIN")?.id || "" 
        : roles.find(r => r.code === "AGENT")?.id || "",
      status: user.status,
    });
    setDialogOpen(true);
  };

  const openPasswordDialog = (userId: string) => {
    setSelectedUserId(userId);
    setNewPassword("");
    setPasswordDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.displayName) {
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("กรุณาระบุรหัสผ่าน");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";

      const response = await fetch(url, {
        method: editingUser ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }

      toast.success(editingUser ? "แก้ไขเรียบร้อยแล้ว" : "เพิ่มเรียบร้อยแล้ว");
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUserId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }

      toast.success("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
      setPasswordDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ต้องการลบผู้ใช้นี้หรือไม่?")) return;

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">จัดการผู้ใช้งาน</h1>
          <p className="text-gray-600 dark:text-gray-400">จัดการบัญชีเจ้าหน้าที่ในระบบ</p>
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                <TableHead>ชื่อ</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead>ทีม</TableHead>
                <TableHead className="w-[100px]">สถานะ</TableHead>
                <TableHead className="w-[150px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    ไม่มีข้อมูล
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.staffRoles.map((sr) => (
                        <Badge key={sr.role.code} variant="outline" className="mr-1">
                          {sr.role.name}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      {user.staffTeams.length > 0 ? (
                        user.staffTeams.map((st, i) => (
                          <span key={i} className="text-sm">
                            {st.team.name}
                            {st.isLeader && <span className="text-yellow-600 ml-1">★</span>}
                            {i < user.staffTeams.length - 1 && ", "}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === "ACTIVE" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user.status === "ACTIVE" ? "ใช้งาน" : "ปิด"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openPasswordDialog(user.id)}
                          title="เปลี่ยนรหัสผ่าน"
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
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

      {/* User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>อีเมล</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>ชื่อที่แสดง</Label>
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="ชื่อผู้ใช้"
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label>รหัสผ่าน</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="รหัสผ่าน"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>บทบาท</Label>
              <Select value={formData.roleId} onValueChange={(v) => setFormData({ ...formData, roleId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ใช้งาน</SelectItem>
                  <SelectItem value="INACTIVE">ปิดใช้งาน</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingUser ? "บันทึก" : "เพิ่ม"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>รหัสผ่านใหม่</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleChangePassword} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              เปลี่ยนรหัสผ่าน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
