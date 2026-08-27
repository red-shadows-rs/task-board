"use client";

import { Home, LayoutDashboard } from "lucide-react";
import Link from "next/link";

import {
  LanguageToggle,
  ThemeToggle,
} from "@/components/common/settingsCommon";
import { PageTitle } from "@/components/common/titleCommon";
import { Footer } from "@/components/layouts/footerLayout";
import { Button } from "@/components/ui/buttonUi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/cardUi";
import { useLanguage } from "@/contexts/languageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-background"
      suppressHydrationWarning
    >
      <PageTitle title="notFound" />

      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{t("common.appName")}</span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="items-center">
            <CardTitle className="text-4xl font-bold text-primary">
              {t("common.notFound.heading")}
            </CardTitle>
            <CardDescription className="text-xl">
              {t("common.notFound.subheading")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              {t("common.notFound.description")}
            </p>
            <Link href="/dashboard/tasks" className="block">
              <Button className="w-full">
                <Home className="h-4 w-4" />
                {t("common.notFound.returnHome")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
