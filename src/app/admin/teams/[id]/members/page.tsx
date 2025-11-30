"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus, Loader2, UserMinus, Crown } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

interface TeamMember {
  id: string;
  isLeader: boolean;
  staff: {
    id: string;
    displayName: string;
    email: string;
  };
}

interface Team {
  id: string;
  code: string;
  name: string;
  members: TeamMember[];
}

interface StaffUser {
  id: string;
  displayName: string;
  email: string;
}

export default function TeamMembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [availableStaff, setAvailableStaff] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [isLeader, setIsLeader] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [teamRes, staffRes] = await Promise.all([
        fetch(`/api/admin/teams/${resolvedParams.id}`),
        fetch("/api/admin/staff"),
      ]);

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeam(teamData);
      } else {
        toast.error("ไม่พบข้อมูลทีม");
        router.push("/admin/teams");
        return;
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setAvailableStaff(staffData);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedStaffId) {
      toast.error("กรุณาเลือกเจ้าหน้าที่");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/teams/${resolvedParams.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: selectedStaffId,
          isLeader,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }

      toast.success("เพิ่มสมาชิกเรียบร้อยแล้ว");
      setDialogOpen(false);
      setSelectedStaffId("");
      setIsLeader(false);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("ต้องการลบสมาชิกนี้ออกจากทีมหรือไม่?")) return;

    try {
      const response = await fetch(
        `/api/admin/teams/${resolvedParams.id}/members/${memberId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }

      toast.success("ลบสมาชิกเรียบร้อยแล้ว");
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    }
  };

  const handleToggleLeader = async (memberId: string, currentIsLeader: boolean) => {
    try {
      const response = await fetch(
        `/api/admin/teams/${resolvedParams.id}/members/${memberId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isLeader: !currentIsLeader }),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }

      toast.success("อัปเดตเรียบร้อยแล้ว");
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

  if (!team) return null;

  // Filter out staff already in team
  const memberStaffIds = team.members.map((m) => m.staff.id);
  const filteredStaff = availableStaff.filter((s) => !memberStaffIds.includes(s.id));

  return (
    <div className="p-8">
      <Link href="/admin/teams" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        กลับรายการทีม
      </Link>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>สมาชิกทีม: {team.name}</CardTitle>
            <CardDescription>รหัส: {team.code}</CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มสมาชิก
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead className="text-center">หัวหน้าทีม</TableHead>
                <TableHead className="w-[100px]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    ยังไม่มีสมาชิก
                  </TableCell>
                </TableRow>
              ) : (
                team.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.staff.displayName}
                      {member.isLeader && (
                        <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                          <Crown className="h-3 w-3 mr-1" />
                          หัวหน้า
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{member.staff.email}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={member.isLeader}
                        onCheckedChange={() => handleToggleLeader(member.id, member.isLeader)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <UserMinus className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มสมาชิก</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>เจ้าหน้าที่</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกเจ้าหน้าที่" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.displayName} ({staff.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={isLeader}
                onCheckedChange={setIsLeader}
              />
              <Label>เป็นหัวหน้าทีม</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleAddMember} disabled={isSubmitting || !selectedStaffId}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              เพิ่ม
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
