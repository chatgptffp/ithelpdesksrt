"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Mail, MessageCircle, Hash, TestTube, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface NotificationSettings {
  id?: string;
  emailEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
  lineEnabled: boolean;
  lineToken: string;
  discordEnabled: boolean;
  discordWebhook: string;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: false,
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    smtpSecure: true,
    fromEmail: "",
    fromName: "IT Helpdesk",
    lineEnabled: false,
    lineToken: "",
    discordEnabled: false,
    discordWebhook: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState({ email: false, line: false, discord: false });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/notifications/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("บันทึกการตั้งค่าเรียบร้อยแล้ว");
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async (type: 'email' | 'line' | 'discord') => {
    setIsTesting(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(`/api/admin/notifications/test/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success(`ทดสอบ ${type} สำเร็จ`);
      } else {
        toast.error(`ทดสอบ ${type} ไม่สำเร็จ`);
      }
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาดในการทดสอบ ${type}`);
    } finally {
      setIsTesting(prev => ({ ...prev, [type]: false }));
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ตั้งค่าการแจ้งเตือน</h1>
          <p className="text-gray-600 dark:text-gray-400">จัดการการแจ้งเตือนผ่านอีเมล, LINE และ Discord</p>
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
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger 
                value="email" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent gap-2 px-6 py-3"
              >
                <Mail className="h-4 w-4" />
                อีเมล
              </TabsTrigger>
              <TabsTrigger 
                value="line" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent gap-2 px-6 py-3"
              >
                <MessageCircle className="h-4 w-4" />
                LINE Notify
              </TabsTrigger>
              <TabsTrigger 
                value="discord" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent gap-2 px-6 py-3"
              >
                <Hash className="h-4 w-4" />
                Discord
              </TabsTrigger>
            </TabsList>

            {/* Email Settings */}
            <TabsContent value="email" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">การแจ้งเตือนทางอีเมล</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ตั้งค่า SMTP สำหรับส่งอีเมลแจ้งเตือน</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('email')}
                    disabled={!settings.emailEnabled || isTesting.email}
                  >
                    {isTesting.email ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-1" />
                    )}
                    ทดสอบ
                  </Button>
                  <Switch
                    checked={settings.emailEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
                  />
                </div>
              </div>

              {settings.emailEnabled && (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.smtpHost}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.smtpPort}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || 587 }))}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={settings.smtpUser}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                        placeholder="App Password"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        value={settings.fromEmail}
                        onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                        placeholder="noreply@company.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        value={settings.fromName}
                        onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
                        placeholder="IT Helpdesk"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtpSecure"
                      checked={settings.smtpSecure}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smtpSecure: checked }))}
                    />
                    <Label htmlFor="smtpSecure">ใช้ SSL/TLS</Label>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* LINE Notify Settings */}
            <TabsContent value="line" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">LINE Notify</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ส่งการแจ้งเตือนผ่าน LINE Notify</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('line')}
                    disabled={!settings.lineEnabled || isTesting.line}
                  >
                    {isTesting.line ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-1" />
                    )}
                    ทดสอบ
                  </Button>
                  <Switch
                    checked={settings.lineEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, lineEnabled: checked }))}
                  />
                </div>
              </div>

              {settings.lineEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lineToken">LINE Notify Token</Label>
                    <Input
                      id="lineToken"
                      type="password"
                      value={settings.lineToken}
                      onChange={(e) => setSettings(prev => ({ ...prev, lineToken: e.target.value }))}
                      placeholder="LINE Notify Access Token"
                    />
                    <p className="text-xs text-gray-500">
                      รับ Token ได้ที่: <a href="https://notify-bot.line.me/my/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://notify-bot.line.me/my/</a>
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Discord Settings */}
            <TabsContent value="discord" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Discord Webhook</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ส่งการแจ้งเตือนผ่าน Discord Webhook</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection('discord')}
                    disabled={!settings.discordEnabled || isTesting.discord}
                  >
                    {isTesting.discord ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-1" />
                    )}
                    ทดสอบ
                  </Button>
                  <Switch
                    checked={settings.discordEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, discordEnabled: checked }))}
                  />
                </div>
              </div>

              {settings.discordEnabled && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="discordWebhook">Discord Webhook URL</Label>
                    <Textarea
                      id="discordWebhook"
                      value={settings.discordWebhook}
                      onChange={(e) => setSettings(prev => ({ ...prev, discordWebhook: e.target.value }))}
                      placeholder="https://discord.com/api/webhooks/..."
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      สร้าง Webhook ได้ที่: Server Settings → Integrations → Webhooks
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
