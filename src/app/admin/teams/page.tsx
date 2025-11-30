"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Users, Settings, UsersRound } from "lucide-react";
import Link from "next/link";
import { showSuccess, showError, confirmDelete } from "@/lib/swal";
import { useLanguage } from "@/lib/i18n";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Team {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: {
    members: number;
    tickets: number;
    assignmentRules: number;
  };
}

export default function TeamsPage() {
  const { t } = useLanguage();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Team | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/teams");
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
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
      isActive: true,
      sortOrder: teams.length + 1,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: Team) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || "",
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
        ? `/api/admin/teams/${editingItem.id}`
        : "/api/admin/teams";
      
      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
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
      const response = await fetch(`/api/admin/teams/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <UsersRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.teams.title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t.teams.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/teams/rules">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              {t.teams.assignmentRules}
            </Button>
          </Link>
          <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            {t.teams.addTeam}
          </Button>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-800">
                <TableHead className="w-[80px]">{t.common.sortOrder}</TableHead>
                <TableHead>{t.common.code}</TableHead>
                <TableHead>{t.teams.teamName}</TableHead>
                <TableHead>{t.common.description}</TableHead>
                <TableHead className="text-center">{t.teams.memberCount}</TableHead>
                <TableHead className="text-center">{t.teams.ticketCount}</TableHead>
                <TableHead className="w-[100px]">{t.common.status}</TableHead>
                <TableHead className="w-[150px]">{t.common.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {t.common.noData}
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.id} className="dark:border-gray-800">
                    <TableCell>{team.sortOrder}</TableCell>
                    <TableCell className="font-mono">{team.code}</TableCell>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                      {team.description || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{team._count.members}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{team._count.tickets}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        team.isActive 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}>
                        {team.isActive ? t.common.active : t.common.inactive}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/admin/teams/${team.id}/members`}>
                          <Button variant="ghost" size="sm" title={t.common.members}>
                            <Users className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(team)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(team.id, team.name)}>
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
            <DialogTitle>{editingItem ? t.teams.editTeam : t.teams.addTeam}</DialogTitle>
            <DialogDescription>
              {editingItem ? "แก้ไขข้อมูลทีม" : "กรอกข้อมูลเพื่อสร้างทีมใหม่"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.teams.teamCode}</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="TEAM-DEV"
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>{t.common.sortOrder}</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.teams.teamName}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Development Team"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.common.description}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Team description"
                className="rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>{t.common.active}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingItem ? t.common.save : t.common.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
