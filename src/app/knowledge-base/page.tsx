"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Eye, 
  Clock, 
  Loader2,
  ChevronRight,
  Star,
  Shield,
  ArrowLeft
} from "lucide-react";
import { PageHelp } from "@/components/ui/page-help";
import { pageHelpConfig } from "@/lib/page-help-config";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  _count: {
    articles: number;
  };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  viewCount: number;
  isFeatured: boolean;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
  author: {
    displayName: string;
  };
}

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        fetch("/api/kb"),
        fetch("/api/kb/categories"),
      ]);

      if (articlesRes.ok) {
        const data = await articlesRes.json();
        setArticles(data);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredArticles = articles.filter((a) => a.isFeatured);
  
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">IT Helpdesk</span>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden xs:block">การรถไฟแห่งประเทศไทย</p>
            </div>
          </Link>
          <Link href="/report">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 text-xs sm:text-sm">
              แจ้งปัญหาใหม่
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-amber-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-amber-100 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าหลัก
          </Link>
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">สถานีความรู้</h1>
              <p className="text-amber-100 text-sm">Knowledge Base</p>
            </div>
          </div>
          <p className="text-amber-100 mb-6">
            รวบรวมบทความแนะนำวิธีแก้ปัญหาและเคล็ดลับการใช้งานระบบ IT
          </p>

          {/* Search */}
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="ค้นหาบทความ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white text-gray-900 border-0 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Help */}
        <PageHelp items={pageHelpConfig["public-knowledge-base"]} />

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          <Button
            size="sm"
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className={`text-xs sm:text-sm ${selectedCategory === null ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          >
            ทั้งหมด
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs sm:text-sm ${selectedCategory === cat.id ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            >
              {cat.name}
              <Badge variant="secondary" className="ml-1.5 sm:ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] sm:text-xs">
                {cat._count.articles}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Featured Articles */}
        {!searchQuery && !selectedCategory && featuredArticles.length > 0 && (
          <div className="mb-8 sm:mb-10">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 fill-amber-500" />
              บทความแนะนำ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {featuredArticles.slice(0, 2).map((article) => (
                <Link key={article.id} href={`/knowledge-base/${article.slug}`}>
                  <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full overflow-hidden">
                    <div className="relative h-32 sm:h-40 overflow-hidden">
                      {article.coverImage ? (
                        <img
                          src={article.coverImage}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-amber-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-amber-600 text-white border-0">
                          {article.category.name}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 sm:p-5">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(article.publishedAt)}
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Articles */}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {searchQuery ? `ผลการค้นหา "${searchQuery}"` : "บทความทั้งหมด"}
          </h2>

          {filteredArticles.length === 0 ? (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
              <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">ไม่พบบทความที่ต้องการ</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredArticles.map((article) => (
                <Link key={article.id} href={`/knowledge-base/${article.slug}`}>
                  <Card className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all cursor-pointer h-full overflow-hidden">
                    <div className="relative h-32 sm:h-36 overflow-hidden">
                      {article.coverImage ? (
                        <img
                          src={article.coverImage}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-gray-300 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-gray-800/80 text-white">
                          {article.category.name}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.viewCount}
                        </span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
