import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/lib/i18n";
import { BrandingProvider } from "@/contexts/branding-context";
import { PWAInstaller } from "@/components/pwa-installer";
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";
import "./globals.css";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ระบบแจ้งปัญหาการใช้งาน IT",
  description: "ระบบแจ้งปัญหาการใช้งานระบบสำหรับพนักงานภายในองค์กร",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IT Helpdesk",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "IT Helpdesk",
    title: "ระบบแจ้งปัญหาการใช้งาน IT",
    description: "ระบบแจ้งปัญหาการใช้งานระบบสำหรับพนักงานภายในองค์กร",
  },
  twitter: {
    card: "summary",
    title: "ระบบแจ้งปัญหาการใช้งาน IT",
    description: "ระบบแจ้งปัญหาการใช้งานระบบสำหรับพนักงานภายในองค์กร",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${chakraPetch.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <BrandingProvider>
              {children}
              <PWAInstaller />
              <ChatbotWidget />
              <Toaster position="top-center" richColors />
            </BrandingProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
