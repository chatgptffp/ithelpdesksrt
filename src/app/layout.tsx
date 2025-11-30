import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/lib/i18n";
import { BrandingProvider } from "@/contexts/branding-context";
import "./globals.css";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ระบบแจ้งปัญหาการใช้งาน IT",
  description: "ระบบแจ้งปัญหาการใช้งานระบบสำหรับพนักงานภายในองค์กร",
  icons: {
    icon: "/favicon.ico",
  },
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
              <Toaster position="top-center" richColors />
            </BrandingProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
