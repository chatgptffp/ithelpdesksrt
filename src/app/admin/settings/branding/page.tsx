"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save, Building2, Palette, Globe, Upload, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Organization {
  id: string;
  code: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
}

export default function BrandingSettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const response = await fetch("/api/admin/organization");
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setLogoUrl(data.logoUrl || "");
        setFaviconUrl(data.faviconUrl || "");
        setPrimaryColor(data.primaryColor || "#3b82f6");
        setSecondaryColor(data.secondaryColor || "#64748b");
        setAccentColor(data.accentColor || "#f59e0b");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setWebsite(data.website || "");
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
      toast.error("ไม่สามารถดึงข้อมูลองค์กรได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/organization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          logoUrl: logoUrl || null,
          faviconUrl: faviconUrl || null,
          primaryColor,
          secondaryColor,
          accentColor,
          email: email || null,
          phone: phone || null,
          address: address || null,
          website: website || null,
        }),
      });

      if (response.ok) {
        toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
        fetchOrganization();
      } else {
        const error = await response.json();
        toast.error(error.error || "ไม่สามารถบันทึกได้");
      }
    } catch (error) {
      console.error("Error saving organization:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  const resetColors = () => {
    setPrimaryColor("#3b82f6");
    setSecondaryColor("#64748b");
    setAccentColor("#f59e0b");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">ตั้งค่า Branding</h1>
          <p className="text-sm text-muted-foreground">
            ปรับแต่งรูปลักษณ์และข้อมูลองค์กร
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          บันทึก
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general" className="flex-1 min-w-[100px] gap-1 sm:gap-2 text-xs sm:text-sm">
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">ข้อมูล</span>ทั่วไป
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex-1 min-w-[100px] gap-1 sm:gap-2 text-xs sm:text-sm">
            <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
            รูปลักษณ์
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex-1 min-w-[100px] gap-1 sm:gap-2 text-xs sm:text-sm">
            <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">ข้อมูล</span>ติดต่อ
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">ข้อมูลองค์กร</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                ข้อมูลพื้นฐานขององค์กรที่จะแสดงในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">ชื่อองค์กร *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น IT Helpdesk"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">คำอธิบาย</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="คำอธิบายเกี่ยวกับองค์กร"
                  rows={3}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="space-y-6">
            {/* Logo & Favicon */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  โลโก้และไอคอน
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  อัปโหลด URL ของโลโก้และ Favicon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl" className="text-sm">URL โลโก้</Label>
                    <Input
                      id="logoUrl"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="text-sm"
                    />
                    {logoUrl && (
                      <div className="mt-2 p-3 border rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">ตัวอย่าง:</p>
                        <img
                          src={logoUrl}
                          alt="Logo preview"
                          className="max-h-12 sm:max-h-16 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl" className="text-sm">URL Favicon</Label>
                    <Input
                      id="faviconUrl"
                      value={faviconUrl}
                      onChange={(e) => setFaviconUrl(e.target.value)}
                      placeholder="https://example.com/favicon.ico"
                      className="text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                      สีหลัก
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      ปรับแต่งสีที่ใช้ในระบบ
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetColors} className="w-full sm:w-auto">
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    รีเซ็ต
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {/* Primary Color */}
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor" className="text-sm">สีหลัก (Primary)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="primaryColor"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer shrink-0"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 text-sm"
                      />
                    </div>
                  </div>
                  {/* Secondary Color */}
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor" className="text-sm">สีรอง (Secondary)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="secondaryColor"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer shrink-0"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        placeholder="#64748b"
                        className="flex-1 text-sm"
                      />
                    </div>
                  </div>
                  {/* Accent Color */}
                  <div className="space-y-2">
                    <Label htmlFor="accentColor" className="text-sm">สีเน้น (Accent)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="accentColor"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-9 p-1 cursor-pointer shrink-0"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        placeholder="#f59e0b"
                        className="flex-1 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="p-4 border rounded-lg bg-muted/30">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">ตัวอย่างสี:</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-sm border"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">Primary</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-sm border"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">Secondary</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-sm border"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">Accent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">ข้อมูลติดต่อ</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                ข้อมูลสำหรับติดต่อองค์กร
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="support@example.com"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="02-xxx-xxxx"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm">เว็บไซต์</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">ที่อยู่</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ที่อยู่องค์กร"
                  rows={3}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
