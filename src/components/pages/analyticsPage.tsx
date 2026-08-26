"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Download, AlertCircle } from "lucide-react";

import {
  StatsCards,
  TaskCharts,
  ProjectOverviewChart,
  TeamPerformanceChart,
  TaskTrendsChart,
  TrendsSummaryTable,
  ProjectStatusChart,
  ProjectHealthTable,
  TeamPerformanceTable,
  FinancialOverview,
} from "@/components/common/chartsCommon";
import { PageTitle } from "@/components/common/titleCommon";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabsUi";
import { Button } from "@/components/ui/buttonUi";
import { useLanguage } from "@/contexts/languageContext";
import { exportAnalyticsPDF } from "@/utils/pdfUtil";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/selectUi";

import type { Task, Project, Section, User } from "@/types";

type DateRange = "1d" | "7d" | "30d" | "90d" | "all";

const DATE_RANGE_DAYS: Record<Exclude<DateRange, "all">, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground text-sm border rounded-lg bg-muted/30">
      <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
      <span>{message}</span>
    </div>
  );
}

export default function Analytics() {
  const { t, language } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filterTasksByDate = useCallback(
    (allTasks: Task[], range: DateRange): Task[] => {
      if (range === "all") return allTasks;

      const cutoffDate = new Date(
        Date.now() - DATE_RANGE_DAYS[range] * 24 * 60 * 60 * 1000,
      );

      return allTasks.filter((task) => new Date(task.createdAt) >= cutoffDate);
    },
    [],
  );

  const filterTasksByProject = useCallback(
    (allTasks: Task[], projectId: string, allSections: Section[]): Task[] => {
      if (projectId === "all") return allTasks;

      const projectSectionIds = allSections
        .filter((s) => s.projectId === projectId)
        .map((s) => s.id);

      return allTasks.filter((task) =>
        projectSectionIds.includes(task.sectionId),
      );
    },
    [],
  );

  const filteredTasksByDate = useMemo(
    () => filterTasksByDate(tasks, dateRange),
    [tasks, dateRange, filterTasksByDate],
  );

  const filteredTasks = useMemo(
    () => filterTasksByProject(filteredTasksByDate, selectedProject, sections),
    [filteredTasksByDate, selectedProject, sections, filterTasksByProject],
  );

  const filteredProjects = useMemo(() => {
    if (selectedProject === "all") return projects;
    return projects.filter((p) => p.id === selectedProject);
  }, [projects, selectedProject]);

  const filteredUsers = useMemo(() => {
    if (selectedProject === "all") return users;
    const project = projects.find((p) => p.id === selectedProject);
    if (!project) return users;
    return users.filter((u) => project.teamMembers.includes(u.id));
  }, [users, projects, selectedProject]);

  const filteredSections = useMemo(() => {
    if (selectedProject === "all") return sections;
    return sections.filter((s) => s.projectId === selectedProject);
  }, [sections, selectedProject]);

  const handleExportReport = useCallback(async () => {
    try {
      await exportAnalyticsPDF({
        tasks: filteredTasks,
        projects: filteredProjects,
        users: filteredUsers,
        sections: filteredSections,
        dateRange,
        language,
        translations: t,
      });
      toast.success(t("dashboard.analytics.messages.success.exported"));
    } catch {
      toast.error(t("dashboard.analytics.messages.error.exportFailed"));
    }
  }, [
    filteredTasks,
    filteredProjects,
    filteredUsers,
    filteredSections,
    dateRange,
    language,
    t,
  ]);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, projectsRes, usersRes, sectionsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/projects"),
        fetch("/api/users"),
        fetch("/api/sections"),
      ]);

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.tasks || []);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(
          (usersData.users || []).filter((u: User) => u.role !== "client"),
        );
      }

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json();
        setSections(sectionsData.sections || []);
      }
    } catch {
      toast.error(t("dashboard.analytics.messages.error.fetchFailed"));
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dateRanges: { value: DateRange; label: string }[] = useMemo(
    () => [
      { value: "all", label: t("dashboard.analytics.dateRange.all") },
      { value: "1d", label: t("dashboard.analytics.dateRange.1d") },
      { value: "7d", label: t("dashboard.analytics.dateRange.7d") },
      { value: "30d", label: t("dashboard.analytics.dateRange.30d") },
      { value: "90d", label: t("dashboard.analytics.dateRange.90d") },
    ],
    [t],
  );

  const tabsOrder = useMemo(
    () =>
      language === "ar"
        ? ["trends", "team", "projects", "financial", "overview"]
        : ["overview", "financial", "projects", "team", "trends"],
    [language],
  );

  if (!mounted) return null;

  return (
    <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-8 py-8">
      <PageTitle title="analytics" />

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <Select
            value={dateRange}
            onValueChange={(value) => setDateRange(value as DateRange)}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <SelectTrigger
              className="w-full sm:w-[200px]"
              suppressHydrationWarning
            >
              <SelectValue
                placeholder={t("dashboard.analytics.filters.dateRange")}
              />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <SelectTrigger
              className="w-full sm:w-[200px]"
              suppressHydrationWarning
            >
              <SelectValue
                placeholder={t("dashboard.analytics.filters.allProjects")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("dashboard.analytics.filters.allProjects")}
              </SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {language === "ar" ? project.title.ar : project.title.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleExportReport}>
          <Download className="h-4 w-4" />
          {t("dashboard.analytics.actions.export")}
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-12 bg-muted/50 p-1 rounded-xl">
          {tabsOrder.map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium transition-all"
            >
              {t(`dashboard.analytics.tabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-8">
          <StatsCards
            tasks={filteredTasks}
            projects={filteredProjects}
            users={filteredUsers}
          />
          {filteredTasks.length === 0 ? (
            <EmptyState message={t("dashboard.analytics.labels.noData")} />
          ) : (
            <TaskCharts tasks={filteredTasks} language={language} />
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6 mt-8">
          {filteredProjects.length === 0 ? (
            <EmptyState message={t("dashboard.analytics.labels.noData")} />
          ) : (
            <>
              <ProjectOverviewChart
                projects={filteredProjects}
                sections={filteredSections}
                tasks={filteredTasks}
              />
              <ProjectStatusChart projects={filteredProjects} />
              <ProjectHealthTable
                projects={filteredProjects}
                sections={filteredSections}
                tasks={filteredTasks}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-8">
          {filteredUsers.length === 0 ? (
            <EmptyState message={t("dashboard.analytics.labels.noData")} />
          ) : (
            <>
              <TeamPerformanceChart
                users={filteredUsers}
                tasks={filteredTasks}
              />
              <TeamPerformanceTable
                users={filteredUsers}
                tasks={filteredTasks}
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 mt-8">
          {filteredTasks.length === 0 ? (
            <EmptyState message={t("dashboard.analytics.labels.noData")} />
          ) : (
            <>
              <TaskTrendsChart tasks={filteredTasks} />
              <TrendsSummaryTable tasks={filteredTasks} />
            </>
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-6 mt-8">
          {filteredTasks.length === 0 && filteredProjects.length === 0 ? (
            <EmptyState message={t("dashboard.analytics.labels.noData")} />
          ) : (
            <FinancialOverview
              tasks={filteredTasks}
              projects={filteredProjects}
              users={filteredUsers}
              sections={filteredSections}
            />
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
