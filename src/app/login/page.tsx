"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LayoutDashboard, Lock, LogIn, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { loginSchema } from "@/app/api/shared/validatorsShared";
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
import { Input } from "@/components/ui/inputUi";
import { Label } from "@/components/ui/labelUi";
import { Loading } from "@/components/common/loadingCommon";
import { useLanguage } from "@/contexts/languageContext";
import { useStore } from "@/contexts/storeContext";

import type { LoginInput } from "@/app/api/shared/validatorsShared";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();
  const setUser = useStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          router.replace("/dashboard/tasks");
          return;
        }
      } catch (_error) {
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const getErrorMessage = (message: string | undefined): string => {
    if (!message) return "";
    switch (message) {
      case "Invalid email address":
        return t("common.validation.invalidEmail");
      case "Password must be at least 6 characters":
        return t("auth.messages.error.invalidPassword");
      case "Invalid credentials":
        return t("auth.messages.error.invalidCredentials");
      default:
        return message;
    }
  };

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        setIsLoading(false);
        const errorMessage =
          error.error === "Invalid credentials"
            ? t("auth.messages.error.invalidCredentials")
            : error.error || t("auth.messages.error.login");
        throw new Error(errorMessage);
      }

      const { user } = await response.json();
      setUser(user);

      const redirectUrl = "/dashboard/tasks";

      window.location.assign(redirectUrl);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading fullScreen />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-background"
      suppressHydrationWarning
    >
      <PageTitle title="login" />

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
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold !text-center">
              {t("auth.header.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.header.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email" className="inline-flex items-center">
                  <Mail className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {t("auth.form.fields.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", { required: false })}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {getErrorMessage(errors.email.message)}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="inline-flex items-center">
                  <Lock className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {t("auth.form.fields.password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...register("password", { required: false })}
                    className="ltr:pr-10 rtl:pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {getErrorMessage(errors.password.message)}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loading size="sm" />
                    <span className="ltr:ml-2 rtl:mr-2">
                      {t("auth.form.actions.loading")}
                    </span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {t("auth.form.actions.submit")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
