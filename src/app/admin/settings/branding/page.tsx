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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

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

  const handleUpload = async (file: File, type: "logo" | "favicon") => {
    const setUploading = type === "logo" ? setIsUploadingLogo : setIsUploadingFavicon;
    const setUrl = type === "logo" ? setLogoUrl : setFaviconUrl;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUrl(data.url);
        toast.success(`อัปโหลด${type === "logo" ? "โลโก้" : "Favicon"}สำเร็จ`);
      } else {
        const error = await response.json();
        toast.error(error.error || "อัปโหลดไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ตั้งค่า Branding</h1>
          <p className="text-gray-600 dark:text-gray-400">ปรับแต่งรูปลักษณ์และข้อมูลองค์กร</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          บันทึก
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-0">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger 
                value="general" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent gap-2 px-6 py-3"
              >
                <Building2 className="h-4 w-4" />
                ข้อมูลทั่วไป
              </TabsTrigger>
              <TabsTrigger 
                value="branding" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent gap-2 px-6 py-3"
              >
                <Palette className="h-4 w-4" />
                รูปลักษณ์
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent gap-2 px-6 py-3"
              >
                <Globe className="h-4 w-4" />
                ข้อมูลติดต่อ
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">ข้อมูลองค์กร</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">ข้อมูลพื้นฐานขององค์กรที่จะแสดงในระบบ</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อองค์กร *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="เช่น IT Helpdesk"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">คำอธิบาย</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="คำอธิบายเกี่ยวกับองค์กร"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="p-6 space-y-6">
              {/* Logo & Favicon */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">โลโก้และไอคอน</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">อัปโหลด URL ของโลโก้และ Favicon</p>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Logo Upload */}
                  <div className="space-y-3">
                    <Label>โลโก้องค์กร</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          id="logoFile"
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(file, "logo");
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("logoFile")?.click()}
                          disabled={isUploadingLogo}
                        >
                          {isUploadingLogo ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          อัปโหลดโลโก้
                        </Button>
                        {logoUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setLogoUrl("")}
                            className="text-red-500 hover:text-red-600"
                          >
                            ลบโลโก้
                          </Button>
                        )}
                        <p className="text-xs text-gray-500">PNG, JPG, SVG, WebP (สูงสุด 500KB)</p>
                      </div>
                    </div>
                  </div>

                  {/* Favicon Upload */}
                  <div className="space-y-3">
                    <Label>Favicon</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
                        {faviconUrl ? (
                          <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          id="faviconFile"
                          accept="image/png,image/x-icon,image/ico,image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(file, "favicon");
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("faviconFile")?.click()}
                          disabled={isUploadingFavicon}
                        >
                          {isUploadingFavicon ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          อัปโหลด Favicon
                        </Button>
                        {faviconUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFaviconUrl("")}
                            className="text-red-500 hover:text-red-600"
                          >
                            ลบ Favicon
                          </Button>
                        )}
                        <p className="text-xs text-gray-500">ICO, PNG, SVG (สูงสุด 500KB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">สีหลัก</h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetColors}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    รีเซ็ต
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">ปรับแต่งสีที่ใช้ในระบบ</p>
                
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {/* Primary Color */}
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">สีหลัก (Primary)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="primaryColor"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer shrink-0"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    {/* Secondary Color */}
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">สีรอง (Secondary)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="secondaryColor"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer shrink-0"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          placeholder="#64748b"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    {/* Accent Color */}
                    <div className="space-y-2">
                      <Label htmlFor="accentColor">สีเน้น (Accent)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          id="accentColor"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer shrink-0"
                        />
                        <Input
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          placeholder="#f59e0b"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">ตัวอย่างสี:</p>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 h-12 rounded-lg shadow-sm border"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <span className="text-xs text-gray-500">Primary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 h-12 rounded-lg shadow-sm border"
                          style={{ backgroundColor: secondaryColor }}
                        />
                        <span className="text-xs text-gray-500">Secondary</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="w-12 h-12 rounded-lg shadow-sm border"
                          style={{ backgroundColor: accentColor }}
                        />
                        <span className="text-xs text-gray-500">Accent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">ข้อมูลติดต่อ</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">ข้อมูลสำหรับติดต่อองค์กร</p>
                
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">อีเมล</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="support@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="02-xxx-xxxx"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">เว็บไซต์</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">ที่อยู่</Label>
                    <Textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="ที่อยู่องค์กร"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
