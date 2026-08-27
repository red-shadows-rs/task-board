import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  CheckCircle2,
  ListTodo,
  Loader2,
  AlertCircle,
  FolderKanban,
  Users,
  TrendingUp,
  Zap,
  DollarSign,
} from "lucide-react";
import { useMemo } from "react";
import * as React from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cardUi";
import { cn } from "@/components/ui/utilsUi";
import { useLanguage } from "@/contexts/languageContext";
import {
  calculateGrandTotal,
  calculateProjectTotal,
  formatPrice,
} from "@/utils/pricingUtils";

import type { Task, Project, User, Section } from "@/types";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground text-sm border rounded-lg bg-muted/30">
      <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
      <span>{message}</span>
    </div>
  );
}

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ChartErrorBoundaryBaseProps extends ChartErrorBoundaryProps {
  fallbackMessage: string;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
}

class ChartErrorBoundaryBase extends React.Component<
  ChartErrorBoundaryBaseProps,
  ChartErrorBoundaryState
> {
  constructor(props: ChartErrorBoundaryBaseProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-[350px] text-muted-foreground text-sm border rounded-lg bg-muted/30">
            <AlertCircle className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            <span>{this.props.fallbackMessage}</span>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

function ChartErrorBoundary({ children, fallback }: ChartErrorBoundaryProps) {
  const { t } = useLanguage();

  return (
    <ChartErrorBoundaryBase
      fallback={fallback}
      fallbackMessage={t("common.charts.loadFailed")}
    >
      {children}
    </ChartErrorBoundaryBase>
  );
}

interface StatsCardsProps {
  tasks: Task[];
  projects?: Project[];
  users?: User[];
}

export function StatsCards({
  tasks,
  projects = [],
  users = [],
}: StatsCardsProps) {
  const { t, language } = useLanguage();

  const stats = useMemo(
    () => ({
      total: tasks.length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
      overdue: tasks.filter((t) => {
        if (!t.dueDate || typeof t.dueDate !== "string" || t.dueDate === "") {
          return false;
        }
        return new Date(t.dueDate) < new Date() && t.status !== "done";
      }).length,
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "active").length,
      totalUsers: users.length,
      completionRate:
        tasks.length > 0
          ? Math.round(
              (tasks.filter((t) => t.status === "done").length / tasks.length) *
                100,
            )
          : 0,
      grandTotal: calculateGrandTotal(tasks),
    }),
    [tasks, projects, users],
  );

  const cards = useMemo(
    () => [
      {
        title: t("common.stats.totalTasks"),
        value: stats.total,
        icon: ListTodo,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        title: t("common.stats.completedTasks"),
        value: stats.done,
        icon: CheckCircle2,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-50 dark:bg-green-900/10",
      },
      {
        title: t("common.stats.inProgressTasks"),
        value: stats.inProgress,
        icon: Loader2,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-900/10",
      },
      {
        title: t("common.stats.overdueTasks"),
        value: stats.overdue,
        icon: AlertCircle,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-900/10",
      },
      {
        title: t("common.stats.completionRate"),
        value: `${stats.completionRate}%`,
        icon: TrendingUp,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
      },
      {
        title: t("common.stats.totalPrice"),
        value: formatPrice(stats.grandTotal, language),
        icon: DollarSign,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/10",
      },
      {
        title: t("common.stats.totalProjects"),
        value: stats.totalProjects,
        icon: FolderKanban,
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/10",
      },
      {
        title: t("common.stats.activeProjects"),
        value: stats.activeProjects,
        icon: Zap,
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-900/10",
      },
      {
        title: t("common.stats.teamMembers"),
        value: stats.totalUsers,
        icon: Users,
        color: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-50 dark:bg-cyan-900/10",
      },
    ],
    [stats, t, language],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card
            key={index}
            className="shadow hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4 rtl:flex-row-reverse">
                <div className={cn("shrink-0 p-3 rounded-xl", card.bg)}>
                  <Icon className={cn("h-6 w-6", card.color)} />
                </div>
                <div className="min-w-0 flex-1 rtl:text-right">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {card.value}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {card.title}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface FinancialOverviewProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  sections: Section[];
}

export function FinancialOverview({
  tasks,
  projects,
  users,
  sections,
}: FinancialOverviewProps) {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const financialData = useMemo(() => {
    const grandTotal = calculateGrandTotal(tasks);

    const projectTotals = projects
      .map((p) => ({
        id: p.id,
        name: language === "ar" ? p.title.ar : p.title.en,
        total: calculateProjectTotal(p.id, sections, tasks),
      }))
      .filter((p) => p.total > 0);

    const userTotals = users
      .map((u) => ({
        id: u.id,
        name: u.name,
        total: tasks
          .filter((t) => t.assignedTo.includes(u.id))
          .reduce((sum, t) => {
            const ap = (t.assigneePrices ?? []).find((p) => p.userId === u.id);
            return sum + (ap?.price ?? 0);
          }, 0),
      }))
      .filter((u) => u.total > 0);

    const userProjectMatrix = users
      .map((user) => {
        const row: Record<string, number> = {};
        let userTotal = 0;

        for (const project of projectTotals) {
          const projectSectionIds = sections
            .filter((s) => s.projectId === project.id)
            .map((s) => s.id);
          const total = tasks
            .filter(
              (t) =>
                projectSectionIds.includes(t.sectionId) &&
                t.assignedTo.includes(user.id),
            )
            .reduce((sum, t) => {
              const ap = (t.assigneePrices ?? []).find(
                (p) => p.userId === user.id,
              );
              return sum + (ap?.price ?? 0);
            }, 0);

          row[project.id] = total;
          userTotal += total;
        }

        return {
          userId: user.id,
          userName: user.name,
          values: row,
          userTotal,
        };
      })
      .filter((u) => u.userTotal > 0);

    return { grandTotal, projectTotals, userTotals, userProjectMatrix };
  }, [tasks, projects, users, sections, language]);

  const hasProjectDetails = financialData.projectTotals.length > 0;

  const statsCards = [
    {
      title: t("common.stats.totalPrice"),
      value: formatPrice(financialData.grandTotal, language),
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
    },
    {
      title: t("dashboard.analytics.financial.projectsWithBudget"),
      value: financialData.projectTotals.length,
      icon: FolderKanban,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/10",
    },
    {
      title: t("dashboard.analytics.financial.paidMembers"),
      value: financialData.userTotals.length,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow duration-200"
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4 rtl:flex-row-reverse">
                  <div className={cn("shrink-0 p-3 rounded-xl", card.bg)}>
                    <Icon className={cn("h-6 w-6", card.color)} />
                  </div>
                  <div className="min-w-0 flex-1 rtl:text-right">
                    <h3 className="text-2xl font-bold tracking-tight">
                      {card.value}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {card.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(financialData.projectTotals.length > 0 ||
        financialData.userTotals.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {financialData.projectTotals.length > 0 && (
            <ChartErrorBoundary>
              <Card>
                <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
                    <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
                    <span className="flex-1 rtl:text-right">
                      {t("dashboard.analytics.financial.byProject")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={financialData.projectTotals}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="name"
                        fontSize={13}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={13}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border rounded-lg p-3.5 shadow-lg rtl:text-right">
                                <p className="text-sm font-semibold mb-2">
                                  {payload[0].payload.name}
                                </p>
                                <p className="text-sm">
                                  <span className="text-muted-foreground">
                                    {t(
                                      "dashboard.analytics.financial.totalLabel",
                                    )}
                                    :{" "}
                                  </span>
                                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {formatPrice(
                                      payload[0].payload.total,
                                      language,
                                    )}
                                  </span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ fill: "transparent" }}
                        wrapperStyle={{
                          direction: isRTL ? "rtl" : "ltr",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#10B981"
                        name={t("dashboard.analytics.financial.totalLabel")}
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </ChartErrorBoundary>
          )}

          {financialData.userTotals.length > 0 && (
            <ChartErrorBoundary>
              <Card>
                <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
                    <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
                    <span className="flex-1 rtl:text-right">
                      {t("dashboard.analytics.financial.byMember")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={financialData.userTotals}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis
                        dataKey="name"
                        fontSize={13}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={13}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border rounded-lg p-3.5 shadow-lg rtl:text-right">
                                <p className="text-sm font-semibold mb-2">
                                  {payload[0].payload.name}
                                </p>
                                <p className="text-sm">
                                  <span className="text-muted-foreground">
                                    {t(
                                      "dashboard.analytics.financial.totalLabel",
                                    )}
                                    :{" "}
                                  </span>
                                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                    {formatPrice(
                                      payload[0].payload.total,
                                      language,
                                    )}
                                  </span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                        cursor={{ fill: "transparent" }}
                        wrapperStyle={{
                          direction: isRTL ? "rtl" : "ltr",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#3B82F6"
                        name={t("dashboard.analytics.financial.totalLabel")}
                        radius={[4, 4, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </ChartErrorBoundary>
          )}
        </div>
      )}

      {!hasProjectDetails ? (
        <EmptyState message={t("dashboard.analytics.financial.noData")} />
      ) : (
        <Card>
          <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
            <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
              <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
              <span className="flex-1 rtl:text-right">
                {t("dashboard.analytics.financial.details")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    {isRTL ? (
                      <>
                        <th className="ltr:text-left rtl:text-right py-3.5 px-4 font-semibold text-sm">
                          {t("dashboard.analytics.financial.totalLabel")}
                        </th>
                        {[...financialData.projectTotals].reverse().map((p) => (
                          <th
                            key={p.id}
                            className="ltr:text-left rtl:text-right py-3.5 px-4 font-semibold text-sm"
                          >
                            {p.name}
                          </th>
                        ))}
                        <th className="ltr:text-left rtl:text-right py-3.5 px-4 font-semibold text-sm">
                          {t("dashboard.analytics.financial.nameLabel")}
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="ltr:text-left rtl:text-right py-3.5 px-4 font-semibold text-sm">
                          {t("dashboard.analytics.financial.nameLabel")}
                        </th>
                        {financialData.projectTotals.map((p) => (
                          <th
                            key={p.id}
                            className="ltr:text-left rtl:text-right py-3.5 px-4 font-semibold text-sm"
                          >
                            {p.name}
                          </th>
                        ))}
                        <th className="ltr:text-left rtl:text-right py-3.5 px-4 font-semibold text-sm">
                          {t("dashboard.analytics.financial.totalLabel")}
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {financialData.userProjectMatrix.map((row) => (
                    <tr key={row.userId} className="border-b hover:bg-muted/50">
                      {isRTL ? (
                        <>
                          <td className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                            {formatPrice(row.userTotal, language)}
                          </td>
                          {[...financialData.projectTotals]
                            .reverse()
                            .map((p) => (
                              <td
                                key={p.id}
                                className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm tabular-nums"
                              >
                                {row.values[p.id] > 0 ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {formatPrice(row.values[p.id], language)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </td>
                            ))}
                          <td className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-medium">
                            {row.userName}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-medium">
                            {row.userName}
                          </td>
                          {financialData.projectTotals.map((p) => (
                            <td
                              key={p.id}
                              className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm tabular-nums"
                            >
                              {row.values[p.id] > 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  {formatPrice(row.values[p.id], language)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          ))}
                          <td className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                            {formatPrice(row.userTotal, language)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  <tr className="border-b bg-muted/30 font-semibold">
                    {isRTL ? (
                      <>
                        <td className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                          {formatPrice(financialData.grandTotal, language)}
                        </td>
                        {[...financialData.projectTotals].reverse().map((p) => (
                          <td
                            key={p.id}
                            className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-medium tabular-nums text-emerald-600 dark:text-emerald-400"
                          >
                            {formatPrice(p.total, language)}
                          </td>
                        ))}
                        <td className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-medium">
                          {t("dashboard.analytics.financial.projectTotal")}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-medium">
                          {t("dashboard.analytics.financial.projectTotal")}
                        </td>
                        {financialData.projectTotals.map((p) => (
                          <td
                            key={p.id}
                            className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-medium tabular-nums text-emerald-600 dark:text-emerald-400"
                          >
                            {formatPrice(p.total, language)}
                          </td>
                        ))}
                        <td className="ltr:text-left rtl:text-right py-3.5 px-4 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                          {formatPrice(financialData.grandTotal, language)}
                        </td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface LegendPayloadItem {
  value: string;
  color?: string;
}

interface LegendProps {
  payload?: LegendPayloadItem[];
  language?: string;
}

const CustomLegend = ({ payload, language }: LegendProps) => {
  const displayPayload =
    language === "ar" ? [...(payload || [])].reverse() : payload;

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {displayPayload?.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

interface TaskChartsProps {
  tasks: Task[];
  language?: "en" | "ar";
}

const COLORS = {
  todo: "#6B7280",
  in_progress: "#3B82F6",
  in_review: "#A855F7",
  done: "#10B981",
};

const renderCustomizedLabel = (entry: { value: number }, total: number) => {
  const percentage = total > 0 ? Math.round((entry.value / total) * 100) : 0;
  return percentage > 0 ? `${percentage}%` : "";
};

export function TaskCharts({ tasks, language: propLanguage }: TaskChartsProps) {
  const { t, language: contextLanguage } = useLanguage();
  const language: "en" | "ar" = propLanguage ?? contextLanguage;

  const statusData = useMemo(
    () => [
      {
        name: t("common.status.todo"),
        value: tasks.filter((t) => t.status === "todo").length,
        color: COLORS.todo,
      },
      {
        name: t("common.status.in_progress"),
        value: tasks.filter((t) => t.status === "in_progress").length,
        color: COLORS.in_progress,
      },
      {
        name: t("common.status.in_review"),
        value: tasks.filter((t) => t.status === "in_review").length,
        color: COLORS.in_review,
      },
      {
        name: t("common.status.done"),
        value: tasks.filter((t) => t.status === "done").length,
        color: COLORS.done,
      },
    ],
    [tasks, t],
  );

  const priorityData = useMemo(
    () => [
      {
        name: t("dashboard.tasks.priority.low"),
        value: tasks.filter((t) => t.priority === "low").length,
        fill: "#10B981",
      },
      {
        name: t("dashboard.tasks.priority.medium"),
        value: tasks.filter((t) => t.priority === "medium").length,
        fill: "#3B82F6",
      },
      {
        name: t("dashboard.tasks.priority.high"),
        value: tasks.filter((t) => t.priority === "high").length,
        fill: "#F59E0B",
      },
      {
        name: t("dashboard.tasks.priority.urgent"),
        value: tasks.filter((t) => t.priority === "urgent").length,
        fill: "#EF4444",
      },
    ],
    [tasks, t],
  );

  const displayPriorityData = useMemo(
    () => (language === "ar" ? [...priorityData].reverse() : priorityData),
    [priorityData, language],
  );

  interface TooltipPayloadItem {
    name?: string;
    value?: number;
    payload?: {
      name?: string;
      value?: number;
    };
  }

  interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayloadItem[];
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border rounded-lg p-3.5 shadow-lg rtl:text-right">
          <p className="text-sm font-semibold mb-1">
            {data.payload?.name || data.name}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">
              {t("common.stats.totalTasks")}:{" "}
            </span>
            <span className="font-medium text-foreground">
              {data.payload?.value || data.value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const isRTL = language === "ar";

  const statusCard = (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardHeader className="border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
        <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
          <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
          <span className="flex-1 rtl:text-right">
            {t("dashboard.analytics.labels.tasksByStatus")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={(entry) =>
                renderCustomizedLabel(
                  entry,
                  statusData.reduce((sum, item) => sum + item.value, 0),
                )
              }
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={CustomTooltip}
              wrapperStyle={{ direction: isRTL ? "rtl" : "ltr" }}
            />
            <Legend
              content={<CustomLegend payload={undefined} language={language} />}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const priorityCard = (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardHeader className="border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
        <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
          <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
          <span className="flex-1 rtl:text-right">
            {t("dashboard.analytics.trends.byPriority")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={displayPriorityData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              fontSize={13}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              fontSize={13}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={CustomTooltip}
              cursor={{ fill: "transparent" }}
              wrapperStyle={{ direction: isRTL ? "rtl" : "ltr" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const cards = isRTL
    ? [
        { key: "priority", element: priorityCard },
        { key: "status", element: statusCard },
      ]
    : [
        { key: "status", element: statusCard },
        { key: "priority", element: priorityCard },
      ];

  if (tasks.length === 0) {
    return (
      <ChartErrorBoundary>
        <EmptyState message={t("dashboard.analytics.labels.noData")} />
      </ChartErrorBoundary>
    );
  }

  return (
    <ChartErrorBoundary>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <React.Fragment key={card.key}>{card.element}</React.Fragment>
        ))}
      </div>
    </ChartErrorBoundary>
  );
}

interface ProjectOverviewChartProps {
  projects: Project[];
  sections: Section[];
  tasks: Task[];
}

export function ProjectOverviewChart({
  projects,
  sections,
  tasks,
}: ProjectOverviewChartProps) {
  const { t, language } = useLanguage();

  const projectData = useMemo(
    () =>
      projects.map((project) => {
        const projectSections = sections.filter(
          (s) => s.projectId === project.id,
        );
        const sectionIds = projectSections.map((s) => s.id);
        const projectTasks = tasks.filter((t) =>
          sectionIds.includes(t.sectionId),
        );

        return {
          name: project.title[language],
          total: projectTasks.length,
          completed: projectTasks.filter((t) => t.status === "done").length,
          inProgress: projectTasks.filter((t) => t.status === "in_progress")
            .length,
          inReview: projectTasks.filter((t) => t.status === "in_review").length,
          todo: projectTasks.filter((t) => t.status === "todo").length,
        };
      }),
    [projects, sections, tasks, language],
  );

  if (projects.length === 0) {
    return (
      <ChartErrorBoundary>
        <EmptyState message={t("dashboard.analytics.labels.noData")} />
      </ChartErrorBoundary>
    );
  }

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
          <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
            <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
            <span className="flex-1 rtl:text-right">
              {t("dashboard.analytics.projects.title")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                fontSize={13}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={13}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3.5 shadow-lg rtl:text-right">
                        <p className="text-sm font-semibold mb-2">
                          {payload[0].payload.name}
                        </p>
                        {payload.map((entry, index: number) => (
                          <p key={index} className="text-sm">
                            <span className="text-muted-foreground">
                              {entry.name}:{" "}
                            </span>
                            <span className="font-medium">{entry.value}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "transparent" }}
                wrapperStyle={{ direction: language === "ar" ? "rtl" : "ltr" }}
              />
              <Bar
                dataKey="completed"
                fill="#10B981"
                name={t("common.status.done")}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="inProgress"
                fill="#3B82F6"
                name={t("common.status.in_progress")}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="inReview"
                fill="#A855F7"
                name={t("common.status.in_review")}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="todo"
                fill="#6B7280"
                name={t("common.status.todo")}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

interface TeamPerformanceChartProps {
  users: User[];
  tasks: Task[];
}

export function TeamPerformanceChart({
  users,
  tasks,
}: TeamPerformanceChartProps) {
  const { t, language } = useLanguage();

  const teamData = useMemo(
    () =>
      users.map((user) => {
        const userTasks = tasks.filter((t) => t.assignedTo.includes(user.id));
        const completedTasks = userTasks.filter(
          (t) => t.status === "done",
        ).length;
        const completionRate =
          userTasks.length > 0
            ? Math.round((completedTasks / userTasks.length) * 100)
            : 0;

        return {
          name: user.name,
          total: userTasks.length,
          completed: completedTasks,
          pending: userTasks.length - completedTasks,
          completionRate,
        };
      }),
    [users, tasks],
  );

  if (users.length === 0) {
    return (
      <ChartErrorBoundary>
        <EmptyState message={t("dashboard.analytics.labels.noData")} />
      </ChartErrorBoundary>
    );
  }

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
          <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
            <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
            <span className="flex-1 rtl:text-right">
              {t("dashboard.analytics.team.title")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                fontSize={13}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={13}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0]?.payload;
                    return (
                      <div className="bg-background border rounded-lg p-3.5 shadow-lg rtl:text-right">
                        <p className="text-sm font-semibold mb-2">
                          {data?.name}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            {t("common.stats.completedTasks")}:{" "}
                          </span>
                          <span className="font-medium">{data?.completed}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            {t("common.stats.totalTasks")}:{" "}
                          </span>
                          <span className="font-medium">{data?.total}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            {t("common.stats.completionRate")}:{" "}
                          </span>
                          <span className="font-medium">
                            {data?.completionRate}%
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "transparent" }}
                wrapperStyle={{ direction: language === "ar" ? "rtl" : "ltr" }}
              />
              <Bar
                dataKey="completed"
                fill="#10B981"
                name={t("common.stats.completedTasks")}
                barSize={20}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                fill="#3B82F6"
                name={t("common.stats.pendingTasks")}
                barSize={20}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

interface TaskTrendsChartProps {
  tasks: Task[];
}

export function TaskTrendsChart({ tasks }: TaskTrendsChartProps) {
  const { t, language } = useLanguage();

  const trendData = useMemo(() => {
    const grouped: { [key: number]: { created: number; completed: number } } =
      {};

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      if (language === "ar") {
        return `${day}/${month}/${year}`;
      } else {
        return `${month}/${day}/${year}`;
      }
    };

    tasks.forEach((task) => {
      const date = new Date(task.createdAt);
      const timestamp = date.setHours(0, 0, 0, 0);

      if (!grouped[timestamp]) {
        grouped[timestamp] = { created: 0, completed: 0 };
      }

      grouped[timestamp].created++;

      if (task.status === "done") {
        const completionDateStr = task.completedAt || task.updatedAt;
        if (completionDateStr) {
          const completedDate = new Date(completionDateStr);
          const completedTimestamp = completedDate.setHours(0, 0, 0, 0);
          if (!grouped[completedTimestamp]) {
            grouped[completedTimestamp] = { created: 0, completed: 0 };
          }
          grouped[completedTimestamp].completed++;
        }
      }
    });

    return Object.entries(grouped)
      .map(([timestamp, data]) => ({
        date: formatDate(new Date(Number(timestamp))),
        timestamp: Number(timestamp),
        created: data.created,
        completed: data.completed,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [tasks, language]);

  if (tasks.length === 0) {
    return (
      <ChartErrorBoundary>
        <EmptyState message={t("dashboard.analytics.labels.noData")} />
      </ChartErrorBoundary>
    );
  }

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
          <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
            <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
            <span className="flex-1 rtl:text-right">
              {t("dashboard.analytics.trends.title")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                fontSize={13}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={13}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3.5 shadow-lg rtl:text-right">
                        <p className="text-sm font-semibold mb-2">
                          {payload[0].payload.date}
                        </p>
                        {payload.map((entry, index: number) => (
                          <p key={index} className="text-sm">
                            <span className="text-muted-foreground">
                              {entry.name}:{" "}
                            </span>
                            <span className="font-medium">{entry.value}</span>
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "transparent" }}
                wrapperStyle={{ direction: language === "ar" ? "rtl" : "ltr" }}
              />
              <Line
                type="monotone"
                dataKey="created"
                stroke="#3B82F6"
                strokeWidth={2}
                name={t("dashboard.analytics.trends.createdTasks")}
                dot={{ fill: "#3B82F6" }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                strokeWidth={2}
                name={t("common.stats.completedTasks")}
                dot={{ fill: "#10B981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

interface TrendsSummaryTableProps {
  tasks: Task[];
}

export function TrendsSummaryTable({ tasks }: TrendsSummaryTableProps) {
  const { t, language } = useLanguage();

  const trendsData = useMemo(() => {
    const grouped: {
      [key: number]: { created: number; completed: number; overdue: number };
    } = {};

    tasks.forEach((task) => {
      const date = new Date(task.createdAt);
      const timestamp = date.setHours(0, 0, 0, 0);

      if (!grouped[timestamp]) {
        grouped[timestamp] = { created: 0, completed: 0, overdue: 0 };
      }

      grouped[timestamp].created++;

      if (task.status === "done") {
        grouped[timestamp].completed++;
      }

      if (
        task.dueDate &&
        typeof task.dueDate === "string" &&
        task.dueDate !== ""
      ) {
        const dueDate = new Date(task.dueDate);
        if (dueDate < new Date() && task.status !== "done") {
          grouped[timestamp].overdue++;
        }
      }
    });

    return Object.entries(grouped)
      .map(([timestamp, data]) => {
        const completionRate =
          data.created > 0
            ? Math.round((data.completed / data.created) * 100)
            : 0;
        const dateObj = new Date(Number(timestamp));
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");

        let formattedDate: string;
        if (language === "ar") {
          formattedDate = `${day}/${month}/${year}`;
        } else {
          formattedDate = `${month}/${day}/${year}`;
        }

        return {
          date: formattedDate,
          timestamp: Number(timestamp),
          created: data.created,
          completed: data.completed,
          overdue: data.overdue,
          completionRate,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [tasks, language]);

  const isRTL = language === "ar";

  type ColumnDef = {
    key: string;
    header: string;
    numeric?: boolean;
    cell: (row: (typeof trendsData)[0]) => React.ReactNode;
  };

  const columns: ColumnDef[] = [
    {
      key: "date",
      header: t("dashboard.analytics.trends.dateRange"),
      cell: (row) => row.date,
    },
    {
      key: "created",
      header: t("dashboard.analytics.trends.createdTasks"),
      numeric: true,
      cell: (row) => row.created,
    },
    {
      key: "completed",
      header: t("common.stats.completedTasks"),
      numeric: true,
      cell: (row) => row.completed,
    },
    {
      key: "overdue",
      header: t("common.stats.overdueTasks"),
      numeric: true,
      cell: (row) => (
        <span className={row.overdue > 0 ? "text-red-600 font-medium" : ""}>
          {row.overdue}
        </span>
      ),
    },
    {
      key: "completionRate",
      header: t("common.stats.completionRate"),
      numeric: true,
      cell: (row) => (
        <span
          className={`font-medium ${
            row.completionRate >= 70
              ? "text-green-600"
              : row.completionRate >= 40
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {row.completionRate}%
        </span>
      ),
    },
  ];

  const displayColumns = isRTL ? [...columns].reverse() : columns;

  if (trendsData.length === 0) {
    return <EmptyState message={t("dashboard.analytics.labels.noData")} />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
        <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
          <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
          <span className="flex-1 rtl:text-right">
            {t("dashboard.analytics.trends.summary")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {displayColumns.map((col) => (
                  <th
                    key={col.key}
                    className="ltr:text-left rtl:text-right py-3.5 px-4 font-semibold text-sm"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trendsData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  {displayColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "ltr:text-left rtl:text-right py-3.5 px-4 text-sm",
                        col.numeric && "tabular-nums",
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProjectStatusChartProps {
  projects: Project[];
}

export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const { t, language } = useLanguage();

  const statusData = useMemo(
    () => [
      {
        name: t("dashboard.projects.status.planning"),
        value: projects.filter((p) => p.status === "planning").length,
        color: "#6B7280",
      },
      {
        name: t("dashboard.projects.status.active"),
        value: projects.filter((p) => p.status === "active").length,
        color: "#3B82F6",
      },
      {
        name: t("dashboard.projects.status.completed"),
        value: projects.filter((p) => p.status === "completed").length,
        color: "#10B981",
      },
      {
        name: t("dashboard.projects.status.on_hold"),
        value: projects.filter((p) => p.status === "on_hold").length,
        color: "#F59E0B",
      },
    ],
    [projects, t],
  );

  if (projects.length === 0) {
    return (
      <ChartErrorBoundary>
        <EmptyState message={t("dashboard.analytics.labels.noData")} />
      </ChartErrorBoundary>
    );
  }

  return (
    <ChartErrorBoundary>
      <Card>
        <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
          <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
            <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
            <span className="flex-1 rtl:text-right">
              {t("dashboard.analytics.projects.projectStatusDistribution")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={(entry) =>
                  renderCustomizedLabel(
                    entry,
                    statusData.reduce((sum, item) => sum + item.value, 0),
                  )
                }
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3.5 shadow-lg rtl:text-right">
                        <p className="text-sm font-semibold mb-1">
                          {payload[0].payload.name}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            {t("common.stats.totalProjects")}:{" "}
                          </span>
                          <span className="font-medium">
                            {payload[0].payload.value}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                wrapperStyle={{ direction: language === "ar" ? "rtl" : "ltr" }}
              />
              <Legend
                content={
                  <CustomLegend payload={undefined} language={language} />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ChartErrorBoundary>
  );
}

interface ProjectHealthTableProps {
  projects: Project[];
  sections: Section[];
  tasks: Task[];
}

export function ProjectHealthTable({
  projects,
  sections,
  tasks,
}: ProjectHealthTableProps) {
  const { t, language } = useLanguage();

  const projectHealth = useMemo(
    () =>
      projects.map((project) => {
        const projectSections = sections.filter(
          (s) => s.projectId === project.id,
        );
        const sectionIds = projectSections.map((s) => s.id);
        const projectTasks = tasks.filter((t) =>
          sectionIds.includes(t.sectionId),
        );

        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(
          (t) => t.status === "done",
        ).length;
        const overdueTasks = projectTasks.filter((t) => {
          if (!t.dueDate || typeof t.dueDate !== "string" || t.dueDate === "") {
            return false;
          }
          return new Date(t.dueDate) < new Date() && t.status !== "done";
        }).length;
        const completionRate =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          id: project.id,
          name: project.title[language],
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate,
          status: project.status,
        };
      }),
    [projects, sections, tasks, language],
  );

  const isRTL = language === "ar";

  type ProjectHealthColumnDef = {
    key: string;
    header: string;
    numeric?: boolean;
    cell: (row: (typeof projectHealth)[0]) => React.ReactNode;
  };

  const columns: ProjectHealthColumnDef[] = [
    {
      key: "name",
      header: t("dashboard.analytics.projects.projectName"),
      cell: (row) => row.name,
    },
    {
      key: "totalTasks",
      header: t("common.stats.totalTasks"),
      numeric: true,
      cell: (row) => row.totalTasks,
    },
    {
      key: "completedTasks",
      header: t("dashboard.analytics.team.completedTasks"),
      numeric: true,
      cell: (row) => row.completedTasks,
    },
    {
      key: "overdueTasks",
      header: t("common.stats.overdueTasks"),
      numeric: true,
      cell: (row) => (
        <span
          className={row.overdueTasks > 0 ? "text-red-600 font-medium" : ""}
        >
          {row.overdueTasks}
        </span>
      ),
    },
    {
      key: "completionRate",
      header: t("common.stats.completionRate"),
      numeric: true,
      cell: (row) => (
        <span
          className={`font-medium ${
            row.completionRate >= 70
              ? "text-green-600"
              : row.completionRate >= 40
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {row.completionRate}%
        </span>
      ),
    },
    {
      key: "status",
      header: t("common.status.label"),
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "completed"
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : row.status === "active"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                : row.status === "planning"
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
          }`}
        >
          {t(`dashboard.projects.status.${row.status}`)}
        </span>
      ),
    },
  ];

  const displayColumns = isRTL ? [...columns].reverse() : columns;

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
        <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
          <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
          <span className="flex-1 rtl:text-right">
            {t("dashboard.analytics.projects.projectHealth")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {displayColumns.map((col) => (
                  <th
                    key={col.key}
                    className="ltr:text-left rtl:text-right py-3.5 px-4 font-semibold text-sm"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projectHealth.map((project) => (
                <tr key={project.id} className="border-b hover:bg-muted/50">
                  {displayColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "ltr:text-left rtl:text-right py-3.5 px-4 text-sm",
                        col.numeric && "tabular-nums",
                      )}
                    >
                      {col.cell(project)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface TeamPerformanceTableProps {
  users: User[];
  tasks: Task[];
}

export function TeamPerformanceTable({
  users,
  tasks,
}: TeamPerformanceTableProps) {
  const { t, language } = useLanguage();

  const teamPerformance = useMemo(
    () =>
      users.map((user) => {
        const userTasks = tasks.filter((t) => t.assignedTo.includes(user.id));
        const totalTasks = userTasks.length;
        const completedTasks = userTasks.filter(
          (t) => t.status === "done",
        ).length;
        const inProgressTasks = userTasks.filter(
          (t) => t.status === "in_progress",
        ).length;
        const overdueTasks = userTasks.filter((t) => {
          if (!t.dueDate || typeof t.dueDate !== "string" || t.dueDate === "") {
            return false;
          }
          return new Date(t.dueDate) < new Date() && t.status !== "done";
        }).length;
        const completionRate =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const userPrice = tasks
          .filter((t) => t.assignedTo.includes(user.id))
          .reduce((sum, t) => {
            const ap = (t.assigneePrices ?? []).find(
              (p) => p.userId === user.id,
            );
            return sum + (ap?.price ?? 0);
          }, 0);

        return {
          id: user.id,
          name: user.name,
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          completionRate,
          userPrice,
        };
      }),
    [users, tasks],
  );

  const isRTL = language === "ar";

  type TeamColumnDef = {
    key: string;
    header: string;
    numeric?: boolean;
    cell: (row: (typeof teamPerformance)[0]) => React.ReactNode;
  };

  const columns: TeamColumnDef[] = [
    {
      key: "name",
      header: t("dashboard.analytics.team.memberName"),
      cell: (row) => row.name,
    },
    {
      key: "totalTasks",
      header: t("common.stats.totalTasks"),
      numeric: true,
      cell: (row) => row.totalTasks,
    },
    {
      key: "completedTasks",
      header: t("dashboard.analytics.team.completedTasks"),
      numeric: true,
      cell: (row) => row.completedTasks,
    },
    {
      key: "inProgressTasks",
      header: t("common.stats.inProgressTasks"),
      numeric: true,
      cell: (row) => row.inProgressTasks,
    },
    {
      key: "overdueTasks",
      header: t("common.stats.overdueTasks"),
      numeric: true,
      cell: (row) => (
        <span
          className={row.overdueTasks > 0 ? "text-red-600 font-medium" : ""}
        >
          {row.overdueTasks}
        </span>
      ),
    },
    {
      key: "userPrice",
      header: t("dashboard.tasks.card.price"),
      numeric: true,
      cell: (row) => (
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
          {formatPrice(row.userPrice, language)}
        </span>
      ),
    },
    {
      key: "completionRate",
      header: t("common.stats.completionRate"),
      numeric: true,
      cell: (row) => (
        <span
          className={`font-medium ${
            row.completionRate >= 70
              ? "text-green-600"
              : row.completionRate >= 40
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {row.completionRate}%
        </span>
      ),
    },
  ];

  const displayColumns = isRTL ? [...columns].reverse() : columns;

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-gradient-to-br from-muted/30 to-transparent">
        <CardTitle className="text-base font-semibold flex items-center gap-2 rtl:flex-row-reverse w-full">
          <div className="w-1 h-5 bg-primary rounded-full shrink-0" />
          <span className="flex-1 rtl:text-right">
            {t("dashboard.analytics.team.details")}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {displayColumns.map((col) => (
                  <th
                    key={col.key}
                    className="ltr:text-left rtl:text-right py-3.5 px-4 font-semibold text-sm"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {teamPerformance.map((member) => (
                <tr key={member.id} className="border-b hover:bg-muted/50">
                  {displayColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "ltr:text-left rtl:text-right py-3.5 px-4 text-sm",
                        col.numeric && "tabular-nums",
                      )}
                    >
                      {col.cell(member)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
