"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  BookOpen, 
  Eye,
  EyeOff,
  Star,
  Search
} from "lucide-react";
import { showSuccess, showError, confirmDelete } from "@/lib/swal";
import { useLanguage } from "@/lib/i18n";
import { PageHelp } from "@/components/ui/page-help";
import { pageHelpConfig } from "@/lib/page-help-config";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  viewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  category: Category;
  author: {
    displayName: string;
  };
}

export default function KnowledgeBasePage() {
  const { t } = useLanguage();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/kb/articles"),
        fetch("/api/admin/kb/categories"),
      ]);

      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setArticles(data);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }
    } catch {
      showError(t.messages.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirmDelete(title);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/kb/articles/${id}`, {
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

  const togglePublish = async (article: Article) => {
    try {
      const response = await fetch(`/api/admin/kb/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !article.isPublished }),
      });

      if (!response.ok) throw new Error();

      showSuccess(t.messages.saveSuccess);
      loadData();
    } catch {
      showError(t.messages.error);
    }
  };

  const toggleFeatured = async (article: Article) => {
    try {
      const response = await fetch(`/api/admin/kb/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !article.isFeatured }),
      });

      if (!response.ok) throw new Error();

      showSuccess(t.messages.saveSuccess);
      loadData();
    } catch {
      showError(t.messages.error);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category.id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/25">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Knowledge Base</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">จัดการบทความและคำแนะนำสำหรับผู้ใช้</p>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link href="/admin/knowledge-base/categories">
            <Button variant="outline" size="sm" className="rounded-lg text-xs sm:text-sm">
              หมวดหมู่บทความ
            </Button>
          </Link>
          <Link href="/admin/knowledge-base/new">
            <Button size="sm" className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm">
              <Plus className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">เขียนบทความ</span>
              <span className="sm:hidden">เพิ่ม</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Help */}
      <PageHelp items={pageHelpConfig["admin-knowledge-base"]} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ค้นหาบทความ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-lg">
            <SelectValue placeholder="หมวดหมู่ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Articles - Card layout for mobile, Table for desktop */}
      <div className="hidden lg:block">
        <Card className="rounded-xl border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead className="w-[400px]">บทความ</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead className="text-center">การเข้าชม</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
                  <TableHead className="text-center">แนะนำ</TableHead>
                  <TableHead className="w-[120px]">{t.common.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {t.common.noData}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArticles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {article.coverImage ? (
                            <img
                              src={article.coverImage}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{article.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              โดย {article.author.displayName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: article.category.color || undefined,
                            color: article.category.color || undefined,
                          }}
                        >
                          {article.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-gray-500">{article.viewCount}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublish(article)}
                          className={article.isPublished ? "text-green-600" : "text-gray-400"}
                        >
                          {article.isPublished ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatured(article)}
                          className={article.isFeatured ? "text-yellow-500" : "text-gray-400"}
                        >
                          <Star className={`h-4 w-4 ${article.isFeatured ? "fill-current" : ""}`} />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link href={`/admin/knowledge-base/${article.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(article.id, article.title)}
                          >
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
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-3">
        {filteredArticles.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{t.common.noData}</p>
          </Card>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article.id} className="p-4">
              <div className="flex gap-3">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{article.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    โดย {article.author.displayName}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: article.category.color || undefined,
                        color: article.category.color || undefined,
                      }}
                    >
                      {article.category.name}
                    </Badge>
                    <span className="text-xs text-gray-400">{article.viewCount} views</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => togglePublish(article)}
                  >
                    {article.isPublished ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleFeatured(article)}
                  >
                    <Star className={`h-4 w-4 ${article.isFeatured ? "text-yellow-500 fill-current" : "text-gray-400"}`} />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Link href={`/admin/knowledge-base/${article.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Pencil className="h-3 w-3 mr-1" />
                    แก้ไข
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 text-xs"
                  onClick={() => handleDelete(article.id, article.title)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  ลบ
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
