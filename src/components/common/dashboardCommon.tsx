"use client";

import { Search, LayoutGrid, List } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

import { StatsCards, TaskCharts } from "@/components/common/chartsCommon";
import { KanbanBoard } from "@/components/common/kanbanCommon";
import { PageTitle } from "@/components/common/titleCommon";
import {
  SectionDetailsDialog,
  SectionForm,
  SectionCard,
} from "@/components/common/sectionsCommon";
import {
  TaskDetailsDialog,
  TaskCard,
  TaskForm,
} from "@/components/common/tasksCommon";
import { Button } from "@/components/ui/buttonUi";
import { Input } from "@/components/ui/inputUi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialogUi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectUi";
import { useLanguage } from "@/contexts/languageContext";
import { useStore } from "@/contexts/storeContext";

import type { User, Section, Task, TaskStatus } from "@/types";
import type {
  SectionInput,
  TaskInput,
} from "@/app/api/shared/validatorsShared";

interface DashboardProps {
  user: User;
  showCharts?: boolean;
  dataMode?: "sections" | "tasks";
}

export function Dashboard({
  user,
  showCharts = false,
  dataMode = "sections",
}: DashboardProps) {
  const { t, language } = useLanguage();
  const {
    sections,
    users,
    setUsers,
    setSections,
    setSearchQuery,
    setStatusFilter,
    updateSection,
    projects,
    setProjects,
  } = useStore();

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditSectionDialogOpen, setIsEditSectionDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [statusFilter, setLocalStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 401) {
        window.location.href = "/login";
      } else if (response.status === 403) {
        setUsers([]);
      }
    } catch (_error) {
      setUsers([]);
    }
  }, [setUsers]);

  const fetchSections = useCallback(async () => {
    try {
      const response = await fetch("/api/sections");
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      } else if (response.status === 401) {
        window.location.href = "/login";
      }
    } catch (_error) {}
  }, [setSections]);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (_error) {}
  }, [setProjects]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else if (response.status === 401) {
        window.location.href = "/login";
      }
    } catch (_error) {}
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchProjects();
    fetchSections();
    if (dataMode === "tasks" || showCharts) {
      fetchTasks();
    }
  }, [
    fetchUsers,
    fetchProjects,
    fetchSections,
    fetchTasks,
    dataMode,
    showCharts,
  ]);

  useEffect(() => {
    setSearchQuery(searchTerm);
  }, [searchTerm, setSearchQuery]);

  useEffect(() => {
    setStatusFilter(statusFilter === "all" ? "all" : statusFilter);
  }, [statusFilter, setStatusFilter]);

  const handleSectionClick = useCallback((section: Section) => {
    setSelectedSection(section);
    setIsViewDialogOpen(true);
  }, []);

  const handleEditSection = useCallback((section: Section) => {
    setSelectedSection(section);
    setIsEditSectionDialogOpen(true);
  }, []);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsViewDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsEditTaskDialogOpen(true);
  }, []);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchTasks();
        } else {
          toast.error(t("dashboard.tasks.messages.error.deleteFailed"));
          fetchTasks();
        }
      } catch (_error) {
        toast.error(t("dashboard.tasks.messages.error.deleteFailed"));
        fetchTasks();
      }
    },
    [fetchTasks, t],
  );

  const handleTaskUpdate = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
      );

      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          toast.error(t("dashboard.tasks.messages.error.updateFailed"));
        }
        fetchTasks();
      } catch (_error) {
        toast.error(t("dashboard.tasks.messages.error.updateFailed"));
        fetchTasks();
      }
    },
    [fetchTasks, t],
  );

  const handleEditSubmit = async (data: SectionInput) => {
    if (!selectedSection) return;
    await handleSectionUpdate(
      selectedSection.id,
      data as unknown as Partial<Section>,
    );
    setIsEditSectionDialogOpen(false);
    setSelectedSection(null);
  };

  const handleTaskEditSubmit = async (data: TaskInput) => {
    if (!selectedTask) return;
    await handleTaskUpdate(selectedTask.id, { status: data.status });
    setIsEditTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const displayedSections = useMemo(() => {
    let result = Array.isArray(sections) ? sections : [];

    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.title.ar.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return result;
  }, [sections, searchTerm]);

  const displayedTasks = useMemo(() => {
    let result = tasks;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.en.toLowerCase().includes(lowerTerm) ||
          t.title.ar.toLowerCase().includes(lowerTerm),
      );
    }

    if (statusFilter && statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (projectFilter && projectFilter !== "all" && Array.isArray(sections)) {
      const projectSectionIds = sections
        .filter((s) => s.projectId === projectFilter)
        .map((s) => s.id);
      result = result.filter((t) => projectSectionIds.includes(t.sectionId));
    }

    return result;
  }, [tasks, searchTerm, statusFilter, projectFilter, sections]);

  const handleSectionUpdate = useCallback(
    async (sectionId: string, updates: Partial<Section>) => {
      updateSection(sectionId, updates);

      try {
        const response = await fetch(`/api/sections/${sectionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          toast.error(t("common.apiErrors.failedToUpdateSection"));
        }
        fetchSections();
      } catch (_error) {
        toast.error(t("common.apiErrors.failedToUpdateSection"));
        fetchSections();
      }
    },
    [updateSection, fetchSections, t],
  );

  if (!mounted) return null;

  return (
    <>
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-8 py-8">
        <PageTitle title={showCharts ? "dashboard" : "tasks"} />

        {showCharts && (
          <div className="mb-6">
            <StatsCards tasks={displayedTasks} />
          </div>
        )}

        {showCharts && user.role !== "member" && (
          <div className="mb-6">
            <TaskCharts tasks={displayedTasks} language={language} />
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  dataMode === "tasks"
                    ? t("dashboard.tasks.filters.search")
                    : t("dashboard.filters.search")
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ltr:pl-10 rtl:pr-10"
              />
            </div>

            <Select
              value={projectFilter}
              onValueChange={setProjectFilter}
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              <SelectTrigger
                className="w-full sm:w-[180px]"
                suppressHydrationWarning
              >
                <SelectValue placeholder={t("dashboard.filters.project")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard.filters.allProjects")}
                </SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {language === "ar" ? project.title.ar : project.title.en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={setLocalStatusFilter}
              dir={language === "ar" ? "rtl" : "ltr"}
            >
              <SelectTrigger
                className="w-full sm:w-[180px]"
                suppressHydrationWarning
              >
                <SelectValue placeholder={t("dashboard.filters.status")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard.filters.allStatuses")}
                </SelectItem>
                <SelectItem value="todo">{t("common.status.todo")}</SelectItem>
                <SelectItem value="in_progress">
                  {t("common.status.in_progress")}
                </SelectItem>
                <SelectItem value="in_review">
                  {t("common.status.in_review")}
                </SelectItem>
                <SelectItem value="done">{t("common.status.done")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-1">
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {viewMode === "kanban" ? (
          <KanbanBoard
            tasks={displayedTasks}
            onTaskUpdate={handleTaskUpdate}
            users={users}
            currentUser={user}
            onTaskClick={handleTaskClick}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            projects={projects}
            sections={sections}
            hideDelete={true}
          />
        ) : (
          <div className="space-y-4">
            {dataMode === "tasks" ? (
              displayedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {t("dashboard.tasks.list.noTasks")}
                  </p>
                </div>
              ) : (
                displayedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    users={users}
                    currentUser={user}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={(id, status) =>
                      handleTaskUpdate(id, { status: status as TaskStatus })
                    }
                    onClick={handleTaskClick}
                    projects={projects}
                    sections={sections}
                    isListView={true}
                    hideDelete={true}
                  />
                ))
              )
            ) : displayedSections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t("dashboard.tasks.list.noTasks")}
                </p>
              </div>
            ) : (
              displayedSections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  projects={projects}
                  onClick={handleSectionClick}
                  onEdit={handleEditSection}
                />
              ))
            )}
          </div>
        )}
      </main>

      {selectedSection && dataMode === "sections" && (
        <SectionDetailsDialog
          section={selectedSection}
          projects={projects}
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) setSelectedSection(null);
          }}
        />
      )}

      {selectedTask && (dataMode === "tasks" || viewMode === "kanban") && (
        <TaskDetailsDialog
          task={selectedTask}
          users={users}
          currentUser={user}
          projects={projects}
          sections={sections}
          open={isViewDialogOpen}
          onOpenChange={(open) => {
            setIsViewDialogOpen(open);
            if (!open) setSelectedTask(null);
          }}
        />
      )}

      <Dialog
        open={isEditSectionDialogOpen}
        onOpenChange={(open) => {
          setIsEditSectionDialogOpen(open);
          if (!open) setSelectedSection(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("dashboard.tasks.modals.editSection.title")}
            </DialogTitle>
            <DialogDescription>
              {t("dashboard.tasks.modals.editSection.description")}
            </DialogDescription>
          </DialogHeader>
          {selectedSection && (
            <SectionForm
              section={selectedSection}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setIsEditSectionDialogOpen(false);
                setSelectedSection(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditTaskDialogOpen}
        onOpenChange={(open) => {
          setIsEditTaskDialogOpen(open);
          if (!open) setSelectedTask(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("dashboard.tasks.modals.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("dashboard.tasks.modals.edit.description")}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <TaskForm
              task={selectedTask}
              users={users}
              currentUser={user}
              onSubmit={handleTaskEditSubmit}
              onCancel={() => {
                setIsEditTaskDialogOpen(false);
                setSelectedTask(null);
              }}
              showStatusOnly={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
