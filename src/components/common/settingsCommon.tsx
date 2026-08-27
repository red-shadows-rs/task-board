"use client";

import { Moon, Sun, Monitor, Languages } from "lucide-react";
import { createContext, useContext, useEffect, useState } from "react";

import { Button } from "@/components/ui/buttonUi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenuUi";
import { Loading } from "@/components/common/loadingCommon";
import { useLanguage } from "@/contexts/languageContext";

import type { ReactNode } from "react";
type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "taskboard-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () =>
      (typeof window !== "undefined"
        ? (localStorage.getItem(storageKey) as Theme)
        : defaultTheme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const { t, language } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleThemeChange = (theme: Theme) => {
    setIsChanging(true);
    setTheme(theme);
    setTimeout(() => setIsChanging(false), 500);
  };

  return (
    <>
      {isChanging && <Loading fullScreen />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild suppressHydrationWarning>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-primary/10 transition-colors"
            suppressHydrationWarning
            disabled={isChanging}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">{t("common.theme.toggle")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={language === "ar" ? "start" : "end"}>
          <DropdownMenuItem
            onClick={() => handleThemeChange("light")}
            className="cursor-pointer"
          >
            <Sun className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t("common.theme.light")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleThemeChange("dark")}
            className="cursor-pointer"
          >
            <Moon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t("common.theme.dark")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleThemeChange("system")}
            className="cursor-pointer"
          >
            <Monitor className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
            {t("common.theme.system")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = (lang: "en" | "ar") => {
    setIsChanging(true);
    setLanguage(lang);
    setTimeout(() => setIsChanging(false), 500);
  };

  return (
    <>
      {isChanging && <Loading fullScreen />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild suppressHydrationWarning>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-primary/10 transition-colors"
            suppressHydrationWarning
            disabled={isChanging}
          >
            <Languages className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">{t("common.language.toggle")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={language === "ar" ? "start" : "end"}>
          <DropdownMenuItem
            onClick={() => handleLanguageChange("en")}
            className={`cursor-pointer ${language === "en" ? "bg-primary/10" : ""}`}
          >
            {t("common.language.english")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleLanguageChange("ar")}
            className={`cursor-pointer ${language === "ar" ? "bg-primary/10" : ""}`}
          >
            {t("common.language.arabic")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
