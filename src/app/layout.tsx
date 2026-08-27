import "./globals.css";

import { cookies } from "next/headers";
import { Toaster } from "react-hot-toast";

import { DynamicMetadata } from "@/components/common/metadataCommon";
import { ThemeProvider } from "@/components/common/settingsCommon";
import { ScrollToTop } from "@/components/ui/scrollToTopUi";
import { LanguageProvider } from "@/contexts/languageContext";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TaskBoard - Task Management System",
  description: "Professional task management system for teams and managers",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-icon.svg",
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("language")?.value || "en";
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="apple-touch-icon"
          href="/apple-icon.svg"
          type="image/svg+xml"
        />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider defaultTheme="dark" storageKey="taskboard-theme">
          <LanguageProvider>
            <DynamicMetadata />
            {children}
            <ScrollToTop />
            <Toaster
              position="top-right"
              toastOptions={{
                className: "",
                style: {
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                },
                success: {
                  iconTheme: {
                    primary: "hsl(var(--primary))",
                    secondary: "hsl(var(--primary-foreground))",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "hsl(var(--destructive))",
                    secondary: "hsl(var(--destructive-foreground))",
                  },
                },
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
