"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  ArrowLeft, 
  Eye, 
  Clock, 
  User,
  Loader2,
  Share2,
  Home,
  Shield
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  viewCount: number;
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
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      loadArticle();
    }
  }, [slug]);

  const loadArticle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/kb/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data);
      } else if (response.status === 404) {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error loading article:", error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-8 text-center max-w-md">
          <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ไม่พบบทความ
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            บทความที่คุณต้องการอาจถูกลบหรือไม่มีอยู่จริง
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/knowledge-base">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                ดูบทความทั้งหมด
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                หน้าหลัก
              </Button>
            </Link>
          </div>
        </Card>
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

      {/* Cover Image */}
      {article.coverImage && (
        <div className="relative h-40 sm:h-48 md:h-64 overflow-hidden">
          <img
            src={article.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/knowledge-base">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับ
            </Button>
          </Link>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            แชร์
          </Button>
        </div>

        {/* Category */}
        <Badge className="mb-4 bg-amber-600 text-white">
          {article.category.name}
        </Badge>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {article.author.displayName}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {article.viewCount} views
          </span>
        </div>

        {/* Content */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg mb-6">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div 
              className="prose prose-lg dark:prose-invert max-w-none"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {article.content}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((t) => (
              <Badge key={t.tag.id} variant="outline">
                #{t.tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 border-t border-gray-100 dark:border-gray-700">
          <Link href="/knowledge-base">
            <Button variant="outline" className="w-full sm:w-auto">
              <BookOpen className="h-4 w-4 mr-2" />
              บทความอื่นๆ
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              หน้าหลัก
            </Button>
          </Link>
          <Link href="/report">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              แจ้งปัญหา IT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
