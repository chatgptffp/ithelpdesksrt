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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ตั้งค่า Branding</h1>
          <p className="text-muted-foreground">
            ปรับแต่งรูปลักษณ์และข้อมูลองค์กร
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          บันทึก
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4" />
            ข้อมูลทั่วไป
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            รูปลักษณ์
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Globe className="h-4 w-4" />
            ข้อมูลติดต่อ
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลองค์กร</CardTitle>
              <CardDescription>
                ข้อมูลพื้นฐานขององค์กรที่จะแสดงในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Logo & Favicon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  โลโก้และไอคอน
                </CardTitle>
                <CardDescription>
                  อัปโหลด URL ของโลโก้และ Favicon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL โลโก้</Label>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  {logoUrl && (
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-2">ตัวอย่าง:</p>
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="max-h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">URL Favicon</Label>
                  <Input
                    id="faviconUrl"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    สีหลัก
                  </span>
                  <Button variant="ghost" size="sm" onClick={resetColors}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    รีเซ็ต
                  </Button>
                </CardTitle>
                <CardDescription>
                  ปรับแต่งสีที่ใช้ในระบบ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">สีหลัก (Primary)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">สีรอง (Secondary)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="secondaryColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accentColor">สีเน้น (Accent)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="accentColor"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      placeholder="#f59e0b"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-4 p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">ตัวอย่างสี:</p>
                  <div className="flex gap-2">
                    <div
                      className="w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: primaryColor }}
                      title="Primary"
                    />
                    <div
                      className="w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: secondaryColor }}
                      title="Secondary"
                    />
                    <div
                      className="w-12 h-12 rounded-lg shadow-sm"
                      style={{ backgroundColor: accentColor }}
                      title="Accent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลติดต่อ</CardTitle>
              <CardDescription>
                ข้อมูลสำหรับติดต่อองค์กร
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
