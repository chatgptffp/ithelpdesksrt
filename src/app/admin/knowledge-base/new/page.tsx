"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, BookOpen } from "lucide-react";
import { showSuccess, showError } from "@/lib/swal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    isPublished: false,
    isFeatured: false,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/admin/kb/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch {
      showError("ไม่สามารถโหลดหมวดหมู่ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\sก-๙]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 100);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async () => {
    if (!formData.categoryId || !formData.title || !formData.content) {
      showError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/kb/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }

      showSuccess("บันทึกบทความเรียบร้อยแล้ว");
      router.push("/admin/knowledge-base");
    } catch (error) {
      showError(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/admin/knowledge-base">
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/25">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">เขียนบทความใหม่</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">สร้างบทความสำหรับสถานีความรู้</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <Label>หัวข้อบทความ *</Label>
                <Input
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="เช่น วิธีแก้ปัญหาเครื่องพิมพ์ไม่ทำงาน"
                  className="rounded-xl text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="how-to-fix-printer"
                  className="rounded-xl font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>คำอธิบายสั้น</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="อธิบายสั้นๆ เกี่ยวกับบทความ..."
                  className="rounded-xl"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>เนื้อหา *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="เขียนเนื้อหาบทความที่นี่... (รองรับ Markdown)"
                  className="rounded-xl min-h-[400px] font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-sm">ตั้งค่าการเผยแพร่</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>หมวดหมู่ *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>เผยแพร่</Label>
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>แนะนำ (Featured)</Label>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                บันทึกบทความ
              </Button>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-sm">รูปปก</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formData.coverImage}
                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                folder="kb"
                aspectRatio="video"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
