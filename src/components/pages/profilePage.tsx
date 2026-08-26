"use client";

import {
  User as UserIcon,
  Mail,
  Shield,
  Key,
  Save,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";

import { PageTitle } from "@/components/common/titleCommon";
import { Badge } from "@/components/ui/badgeUi";
import { Button } from "@/components/ui/buttonUi";
import { Card, CardContent } from "@/components/ui/cardUi";
import { Input } from "@/components/ui/inputUi";
import { Label } from "@/components/ui/labelUi";
import { Avatar, AvatarFallback } from "@/components/ui/avatarUi";
import { getRoleColor, cn } from "@/components/ui/utilsUi";
import { useLanguage } from "@/contexts/languageContext";
import type { User } from "@/types";

interface ProfileProps {
  user: User;
}

export default function Profile({ user: initialUser }: ProfileProps) {
  const { t } = useLanguage();
  const [user, setUser] = useState<User>(initialUser);

  const profileSchema = useMemo(
    () =>
      z
        .object({
          name: z.string().min(2, t("profile.messages.error.nameTooShort")),
          email: z.string().email(t("common.validation.invalidEmail")),
          currentPassword: z.string().optional(),
          newPassword: z.string().optional(),
          confirmPassword: z.string().optional(),
        })
        .refine(
          (data) => {
            if (data.newPassword || data.confirmPassword) {
              return data.newPassword === data.confirmPassword;
            }
            return true;
          },
          {
            message: t("profile.messages.error.passwordMismatch"),
            path: ["confirmPassword"],
          },
        )
        .refine(
          (data) => {
            if (data.newPassword) {
              return data.newPassword.length >= 8;
            }
            return true;
          },
          {
            message: t("profile.messages.error.passwordTooShort"),
            path: ["newPassword"],
          },
        )
        .refine(
          (data) => {
            if (data.newPassword) {
              return !!data.currentPassword;
            }
            return true;
          },
          {
            message: t("profile.messages.error.currentPasswordRequired"),
            path: ["currentPassword"],
          },
        ),
    [t],
  );

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, email: user.email || "" },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            reset({ name: data.user.name, email: data.user.email });
          }
        }
      } catch (_error) {}
    };

    fetchUser();
  }, [reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const payload: Record<string, string> = {
        name: data.name,
        email: data.email,
      };

      if (data.newPassword) {
        payload.password = data.newPassword;
        payload.currentPassword = data.currentPassword ?? "";
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          errorData?.error === "Current password is incorrect"
            ? t("profile.messages.error.currentPasswordIncorrect")
            : data.newPassword
              ? t("profile.messages.error.passwordChangeFailed")
              : t("profile.messages.error.updateFailed");
        toast.error(message);
        return;
      }

      const responseData = await response.json();
      if (responseData.user) {
        setUser(responseData.user);
      }

      if (data.newPassword) {
        toast.success(t("profile.messages.success.passwordChanged"));
      } else {
        toast.success(t("profile.messages.success.profileUpdated"));
      }
      reset({ name: data.name, email: data.email });
    } catch (_error) {
      toast.error(t("profile.messages.error.updateFailed"));
    }
  };

  return (
    <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-8 py-8">
      <PageTitle title="profile" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-1 right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-background" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge className={cn(getRoleColor(user.role))}>
                      <Shield className="h-3 w-3 ltr:mr-1.5 rtl:ml-1.5" />
                      {t(`common.role.${user.role}`)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      {t("profile.form.fields.name")}
                    </Label>
                    <Input id="name" {...register("name")} />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t("profile.form.fields.email")}
                    </Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label
                      htmlFor="currentPassword"
                      className="flex items-center gap-2"
                    >
                      <Key className="h-4 w-4" />
                      {t("profile.password.fields.current")}
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...register("currentPassword")}
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-destructive">
                        {errors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label
                        htmlFor="newPassword"
                        className="flex items-center gap-2"
                      >
                        <Key className="h-4 w-4" />
                        {t("profile.password.fields.new")}
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...register("newPassword")}
                      />
                      {errors.newPassword && (
                        <p className="text-sm text-destructive">
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label
                        htmlFor="confirmPassword"
                        className="flex items-center gap-2"
                      >
                        <Key className="h-4 w-4" />
                        {t("profile.password.fields.confirm")}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...register("confirmPassword")}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />
                    ) : (
                      <Save className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    )}
                    {t("common.button.save")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
