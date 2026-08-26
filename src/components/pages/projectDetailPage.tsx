"use client";

import { ArrowLeft, Plus, Search, FileText, Trash2, Ban } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
  TaskForm,
  TaskCard,
  TaskDetailsDialog,
} from "@/components/common/tasksCommon";
import { ProjectSection } from "@/components/pages/projectSectionPage";
import { SectionForm } from "@/components/common/sectionsCommon";
import { Badge } from "@/components/ui/badgeUi";
import { Button } from "@/components/ui/buttonUi";
import { PageTitle } from "@/components/common/titleCommon";
import { Loading } from "@/components/common/loadingCommon";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialogUi";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alertDialogUi";
import { Input } from "@/components/ui/inputUi";
import { useLanguage } from "@/contexts/languageContext";
import { useStore } from "@/contexts/storeContext";
import { exportProjectPDF } from "@/utils/pdfUtil";

import type { User, Project, Section, Task } from "@/types";
import type {
  SectionInput,
  TaskInput,
} from "@/app/api/shared/validatorsShared";

interface ProjectDetailPageProps {
  user: User;
  projectId: string;
}

export function ProjectDetailPage({ user, projectId }: ProjectDetailPageProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();
  const {
    sections,
    users,
    tasks,
    setSections,
    setUsers,
    setTasks,
    addSection,
    updateSection,
    deleteSection,
    addTask,
    updateTask,
    deleteTask,
  } = useStore();

  const [project, setProject] = useState<Project | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCreateSectionDialogOpen, setIsCreateSectionDialogOpen] =
    useState(false);
  const [isEditSectionDialogOpen, setIsEditSectionDialogOpen] = useState(false);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isTaskDetailsDialogOpen, setIsTaskDetailsDialogOpen] = useState(false);
  const [isDeleteSectionDialogOpen, setIsDeleteSectionDialogOpen] =
    useState(false);

  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const tasksRef = useRef<Task[]>([]);

  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => {
      window.removeEventListener("resize", checkIsDesktop);
    };
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === pathname) return;
    setIsNavigating(true);
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (_error) {
      toast.error(t("dashboard.projects.messages.error.fetchFailed"));
    }
  }, [projectId, t]);

  const fetchSections = useCallback(async () => {
    try {
      const response = await fetch(`/api/sections?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        const projectSections = (data.sections || []).sort(
          (a: Section, b: Section) => (a.order || 0) - (b.order || 0),
        );
        setSections(projectSections);
        setExpandedSections(new Set(projectSections.map((s: Section) => s.id)));
      }
    } catch (_error) {
      toast.error(t("dashboard.projects.messages.error.fetchFailed"));
    }
  }, [projectId, setSections, t]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (_error) {
      toast.error(t("dashboard.team.messages.error.fetchFailed"));
    }
  }, [setUsers, t]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await fetch(`/api/tasks?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (_error) {
      toast.error(t("dashboard.tasks.messages.error.fetchFailed"));
    }
  }, [setTasks, t, projectId]);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    fetchProject();
    fetchSections();
    fetchUsers();
    fetchTasks();
  }, [fetchProject, fetchSections, fetchUsers, fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (!isDesktop) return;
    const task = tasksRef.current.find((t: Task) => t.id === event.active.id);
    if (!task) return;
    setActiveDragId(event.active.id as string);

    if (typeof window !== "undefined") {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!isDesktop) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    if (
      active.data.current?.type === "Section" &&
      over.data.current?.type === "Section"
    ) {
      const oldIndex = sections.findIndex((s: Section) => s.id === activeId);
      const newIndex = sections.findIndex((s: Section) => s.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        setSections(newSections);
      }
      return;
    }

    if (active.data.current?.type === "Section") return;

    const activeTask = tasksRef.current.find((t: Task) => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasksRef.current.find((t: Task) => t.id === overId);

    let overSectionId = "";
    if (over.data.current?.type === "Section") {
      overSectionId = over.id as string;
    } else if (overTask) {
      overSectionId = overTask.sectionId;
    }

    if (!overSectionId) return;

    if (activeTask.sectionId !== overSectionId) {
      const newColumnTasks = tasksRef.current.filter(
        (t: Task) => t.sectionId === overSectionId && t.id !== activeTask.id,
      );

      let newOrder: number;
      if (overTask && overTask.sectionId === overSectionId) {
        newOrder = overTask.order ?? 0;
        const updatedTasks = newColumnTasks.map((t) => ({
          ...t,
          order: (t.order ?? 0) >= newOrder ? (t.order ?? 0) + 1 : t.order,
        }));
        const newTasks = tasksRef.current.map((t) =>
          t.id === activeTask.id
            ? { ...t, sectionId: overSectionId, order: newOrder }
            : updatedTasks.find((ut) => ut.id === t.id) || t,
        );
        tasksRef.current = newTasks;
        setTasks(newTasks);
      } else {
        const maxOrder =
          newColumnTasks.length > 0
            ? Math.max(...newColumnTasks.map((t) => t.order ?? 0))
            : -1;
        newOrder = maxOrder + 1;

        const newTasks = tasksRef.current.map((t) =>
          t.id === activeTask.id
            ? { ...t, sectionId: overSectionId, order: newOrder }
            : t,
        );
        tasksRef.current = newTasks;
        setTasks(newTasks);
      }
    } else if (overTask && activeTask.sectionId === overTask.sectionId) {
      const columnTasks = tasksRef.current.filter(
        (t: Task) => t.sectionId === activeTask.sectionId,
      );
      const activeIndex = columnTasks.findIndex((t) => t.id === activeTask.id);
      const overIndex = columnTasks.findIndex((t) => t.id === overTask.id);

      if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
        const reorderedColumn = arrayMove(columnTasks, activeIndex, overIndex);
        const otherTasks = tasksRef.current.filter(
          (t) => t.sectionId !== activeTask.sectionId,
        );

        const tasksWithOrder = reorderedColumn.map((task, index) => ({
          ...task,
          order: index,
        }));

        tasksRef.current = [...otherTasks, ...tasksWithOrder];
        setTasks([...otherTasks, ...tasksWithOrder]);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!isDesktop) return;

    if (typeof window !== "undefined") {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
      });
    }

    setActiveDragId(null);
    const { active, over } = event;

    if (!over) return;

    if (
      active.data.current?.type === "Section" &&
      over.data.current?.type === "Section"
    ) {
      if (active.id !== over.id) {
        const oldIndex = sections.findIndex((s: Section) => s.id === active.id);
        const newIndex = sections.findIndex((s: Section) => s.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newSections = arrayMove(sections, oldIndex, newIndex).map(
            (s: Section, idx: number) => ({
              ...s,
              order: idx,
            }),
          );
          setSections(newSections);

          try {
            await fetch("/api/sections/reorder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                updates: newSections.map((s: Section) => ({
                  id: s.id,
                  order: s.order,
                })),
              }),
            });
          } catch (_error) {
            toast.error(t("common.apiErrors.failedToUpdateSectionOrder"));
          }
        }
      }
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasksRef.current.find((t: Task) => t.id === activeId);
    if (!activeTask) return;

    const overTask = tasksRef.current.find((t: Task) => t.id === overId);
    const isOverSection = over.data.current?.type === "Section";

    let newSectionId = activeTask.sectionId;
    if (isOverSection) {
      newSectionId = over.id as string;
    } else if (overTask) {
      newSectionId = overTask.sectionId;
    }

    if (activeTask.sectionId !== newSectionId) {
      const newColumnTasks = tasksRef.current.filter(
        (t: Task) => t.sectionId === newSectionId && t.id !== activeTask.id,
      );

      const maxOrder =
        newColumnTasks.length > 0
          ? Math.max(...newColumnTasks.map((t) => t.order ?? 0))
          : -1;
      const newOrder = maxOrder + 1;

      const newTasks = tasksRef.current.map((t) =>
        t.id === activeTask.id
          ? { ...t, sectionId: newSectionId, order: newOrder }
          : t,
      );
      tasksRef.current = newTasks;
      setTasks(newTasks);

      try {
        await fetch(`/api/tasks/${activeTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: newSectionId,
            order: newOrder,
          }),
        });
      } catch (_error) {
        toast.error(t("common.apiErrors.failedToMoveTask"));
      }
    } else if (overTask && activeTask.sectionId === overTask.sectionId) {
      const columnTasks = tasksRef.current.filter(
        (t: Task) => t.sectionId === activeTask.sectionId,
      );
      const activeIndex = columnTasks.findIndex((t) => t.id === activeTask.id);
      const overIndex = columnTasks.findIndex((t) => t.id === overTask.id);

      if (activeIndex !== overIndex && activeIndex !== -1 && overIndex !== -1) {
        const reorderedColumn = arrayMove(columnTasks, activeIndex, overIndex);
        const otherTasks = tasksRef.current.filter(
          (t) => t.sectionId !== activeTask.sectionId,
        );

        const tasksWithOrder = reorderedColumn.map((task, index) => ({
          ...task,
          order: index,
        }));

        tasksRef.current = [...otherTasks, ...tasksWithOrder];
        setTasks([...otherTasks, ...tasksWithOrder]);

        try {
          await fetch("/api/tasks/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              updates: tasksWithOrder.map((task) => ({
                id: task.id,
                order: task.order,
              })),
            }),
          });
        } catch (_error) {
          toast.error(t("common.apiErrors.failedToMoveTask"));
        }
      }
    }
  };

  const handleCreateSection = async (sectionData: SectionInput) => {
    try {
      const response = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sectionData, projectId }),
      });

      if (response.ok) {
        const data = await response.json();
        addSection(data.section);
        setIsCreateSectionDialogOpen(false);
        setExpandedSections((prev) => new Set(prev).add(data.section.id));
        toast.success(t("dashboard.tasks.messages.success.created"));
      } else {
        toast.error(t("dashboard.tasks.messages.error.createFailed"));
      }
    } catch (_error) {
      toast.error(t("dashboard.tasks.messages.error.createFailed"));
    }
  };

  const handleCreateTask = async (taskData: TaskInput, files?: File[]) => {
    if (!selectedSection) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const data = await response.json();

        if (files && files.length > 0) {
          try {
            const formData = new FormData();
            files.forEach((file) => formData.append("file", file));

            const uploadResponse = await fetch(
              `/api/tasks/${data.task.id}/image`,
              {
                method: "POST",
                body: formData,
              },
            );

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              data.task = uploadData.task;
            }
          } catch (_error) {
            toast.error(t("dashboard.tasks.messages.error.uploadFailed"));
          }
        }

        addTask(data.task);
        setIsCreateTaskDialogOpen(false);
        setSelectedSection(null);
        toast.success(t("dashboard.tasks.messages.success.created"));
      } else {
        toast.error(t("dashboard.tasks.messages.error.createFailed"));
      }
    } catch (_error) {
      toast.error(t("dashboard.tasks.messages.error.createFailed"));
    }
  };

  const handleUpdateTask = async (taskData: TaskInput, files?: File[]) => {
    if (!selectedTask) return;

    try {
      const payload =
        user.role === "member" ? { status: taskData.status } : taskData;

      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();

        if (files && files.length > 0) {
          try {
            const formData = new FormData();
            files.forEach((file) => formData.append("file", file));

            const uploadResponse = await fetch(
              `/api/tasks/${selectedTask.id}/image`,
              {
                method: "POST",
                body: formData,
              },
            );

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              data.task = uploadData.task;
            }
          } catch (_error) {
            toast.error(t("dashboard.tasks.messages.error.uploadFailed"));
          }
        }

        updateTask(selectedTask.id, data.task);
        setIsEditTaskDialogOpen(false);
        setSelectedTask(null);
        toast.success(t("dashboard.tasks.messages.success.updated"));
      } else {
        toast.error(t("dashboard.tasks.messages.error.updateFailed"));
      }
    } catch (_error) {
      toast.error(t("dashboard.tasks.messages.error.updateFailed"));
    }
  };

  const handleUpdateSection = async (sectionData: SectionInput) => {
    if (!selectedSection) return;
    try {
      const response = await fetch(`/api/sections/${selectedSection.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionData),
      });

      if (response.ok) {
        const data = await response.json();
        updateSection(selectedSection.id, data.section);
        setIsEditSectionDialogOpen(false);
        setSelectedSection(null);
        toast.success(t("dashboard.tasks.messages.success.updated"));
      } else {
        toast.error(t("dashboard.tasks.messages.error.updateFailed"));
      }
    } catch (_error) {
      toast.error(t("dashboard.tasks.messages.error.updateFailed"));
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        deleteSection(sectionId);
        toast.success(t("dashboard.tasks.messages.success.deleted"));
      }
    } catch (_error) {
      toast.error(t("dashboard.tasks.messages.error.deleteFailed"));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        deleteTask(taskId);
        toast.success(t("dashboard.tasks.messages.success.deleted"));
      } else {
        toast.error(t("dashboard.tasks.messages.error.deleteFailed"));
      }
    } catch (_error) {
      toast.error(t("dashboard.tasks.messages.error.deleteFailed"));
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        updateTask(taskId, data.task);
      }
    } catch (_error) {
      toast.error(t("dashboard.tasks.messages.error.updateFailed"));
    }
  };

  const getSectionTasks = (sectionId: string) => {
    return tasks
      .filter((task) => task.sectionId === sectionId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleExportProject = async () => {
    if (!project) return;
    try {
      await exportProjectPDF({
        project,
        sections,
        tasks,
        users,
        language,
        translations: t,
      });
      toast.success(t("dashboard.projects.messages.success.reportGenerated"));
    } catch (_error) {
      toast.error(t("dashboard.projects.messages.error.exportFailed"));
    }
  };

  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.title.ar.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading fullScreen />
      </div>
    );
  }

  return (
    <>
      {isNavigating && <Loading fullScreen />}
      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-8 py-8">
        <PageTitle title="projects" />

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/projects"
              onClick={(e) => handleNavigation(e, "/dashboard/projects")}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              <span>{t("dashboard.projects.header.title")}</span>
            </Link>
            <h1 className="text-2xl font-bold tracking-tight">
              {language === "ar" ? project.title.ar : project.title.en}
            </h1>
            <Badge variant="outline">
              {t(`dashboard.projects.status.${project.status}`)}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportProject}>
              <FileText className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t("dashboard.projects.card.actions.export")}
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("dashboard.tasks.filters.searchSections")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ltr:pl-10 rtl:pr-10"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {(user.role === "leader" || user.role === "client") && (
              <Button
                onClick={() => setIsCreateSectionDialogOpen(true)}
                className="gap-2 flex-1 sm:flex-initial whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                {t("dashboard.tasks.list.createSection")}
              </Button>
            )}
          </div>
        </div>

        <DndContext
          sensors={isDesktop ? sensors : undefined}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            {filteredSections.length === 0 ? (
              <div className="text-center py-16 border rounded-lg bg-muted/5">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  {t("dashboard.tasks.list.noTasks")}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-4">
                  {t("dashboard.tasks.modals.create.description")}
                </p>
              </div>
            ) : (
              <SortableContext
                items={filteredSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredSections.map((section) => (
                  <ProjectSection
                    key={section.id}
                    section={section}
                    tasks={getSectionTasks(section.id)}
                    users={users}
                    currentUser={user}
                    project={project}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                    onEditSection={(s) => {
                      setSelectedSection(s);
                      setIsEditSectionDialogOpen(true);
                    }}
                    onDeleteSection={(s) => {
                      setSectionToDelete(s);
                      setIsDeleteSectionDialogOpen(true);
                    }}
                    onAddTask={(s) => {
                      setSelectedSection(s);
                      setIsCreateTaskDialogOpen(true);
                    }}
                    onEditTask={(t) => {
                      setSelectedTask(t);
                      setIsEditTaskDialogOpen(true);
                    }}
                    onDeleteTask={handleDeleteTask}
                    onTaskStatusChange={handleTaskStatusChange}
                    onTaskClick={(t) => {
                      setSelectedTask(t);
                      setIsTaskDetailsDialogOpen(true);
                    }}
                    isDragDisabled={!isDesktop}
                  />
                ))}
              </SortableContext>
            )}
          </div>
          <DragOverlay>
            {activeDragId ? (
              <div className="opacity-90 rotate-2 scale-105 cursor-grabbing shadow-2xl">
                {(() => {
                  const task = tasksRef.current.find(
                    (t: Task) => t.id === activeDragId,
                  );
                  if (task) {
                    return (
                      <TaskCard
                        task={task}
                        users={users}
                        currentUser={user}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onStatusChange={() => {}}
                        isDragDisabled={true}
                        isOverlay={true}
                        projects={[project]}
                        sections={sections}
                      />
                    );
                  }
                  const section = sections.find((s) => s.id === activeDragId);
                  if (section) {
                    return (
                      <ProjectSection
                        section={section}
                        tasks={getSectionTasks(section.id)}
                        users={users}
                        currentUser={user}
                        expandedSections={expandedSections}
                        toggleSection={() => {}}
                        onEditSection={() => {}}
                        onDeleteSection={() => {}}
                        onAddTask={() => {}}
                        onEditTask={() => {}}
                        onDeleteTask={() => {}}
                        onTaskStatusChange={() => {}}
                        onTaskClick={() => {}}
                        isDragDisabled={true}
                        isOverlay={true}
                      />
                    );
                  }
                  return null;
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <Dialog
          open={isCreateSectionDialogOpen}
          onOpenChange={setIsCreateSectionDialogOpen}
        >
          <DialogContent
            className="max-w-2xl"
            onPointerDownOutside={(e: Event) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {t("dashboard.tasks.modals.createSection.title")}
              </DialogTitle>
              <DialogDescription>
                {t("dashboard.tasks.modals.createSection.description")}
              </DialogDescription>
            </DialogHeader>
            <SectionForm
              onSubmit={handleCreateSection}
              onCancel={() => setIsCreateSectionDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditSectionDialogOpen}
          onOpenChange={setIsEditSectionDialogOpen}
        >
          <DialogContent
            className="max-w-2xl"
            onPointerDownOutside={(e: Event) => e.preventDefault()}
          >
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
                section={selectedSection || undefined}
                onSubmit={handleUpdateSection}
                onCancel={() => {
                  setIsEditSectionDialogOpen(false);
                  setSelectedSection(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isCreateTaskDialogOpen}
          onOpenChange={setIsCreateTaskDialogOpen}
        >
          <DialogContent
            className="max-w-2xl"
            onPointerDownOutside={(e: Event) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {t("dashboard.tasks.modals.create.title")}
              </DialogTitle>
              <DialogDescription>
                {t("dashboard.tasks.modals.create.description")}
              </DialogDescription>
            </DialogHeader>
            {selectedSection && (
              <TaskForm
                sectionId={selectedSection.id}
                users={users}
                onSubmit={handleCreateTask}
                onCancel={() => {
                  setIsCreateTaskDialogOpen(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={isEditTaskDialogOpen}
          onOpenChange={setIsEditTaskDialogOpen}
        >
          <DialogContent
            className="max-w-2xl"
            onPointerDownOutside={(e: Event) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {t("dashboard.tasks.modals.edit.title")}
              </DialogTitle>
              <DialogDescription>
                {t("dashboard.tasks.modals.edit.description")}
              </DialogDescription>
            </DialogHeader>
            {selectedTask && (
              <TaskForm
                task={selectedTask}
                users={users}
                onSubmit={handleUpdateTask}
                onCancel={() => {
                  setIsEditTaskDialogOpen(false);
                  setSelectedTask(null);
                }}
                currentUser={user}
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={isDeleteSectionDialogOpen}
          onOpenChange={setIsDeleteSectionDialogOpen}
        >
          <AlertDialogContent
            onPointerDownOutside={(e: Event) => e.preventDefault()}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("dashboard.tasks.modals.deleteSection.title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("dashboard.tasks.modals.deleteSection.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-2 pt-4">
              <AlertDialogAction
                onClick={() => {
                  if (sectionToDelete) {
                    handleDeleteSection(sectionToDelete.id);
                    setIsDeleteSectionDialogOpen(false);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                <Trash2 className="h-4 w-4" />
                {t("common.button.delete")}
              </AlertDialogAction>
              <AlertDialogCancel
                className="mt-0"
                onClick={() => setIsDeleteSectionDialogOpen(false)}
              >
                <Ban className="h-4 w-4" />
                {t("common.button.cancel")}
              </AlertDialogCancel>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {isTaskDetailsDialogOpen && selectedTask && (
          <TaskDetailsDialog
            task={selectedTask}
            users={users}
            currentUser={user}
            projects={[project]}
            sections={sections}
            open={isTaskDetailsDialogOpen}
            onOpenChange={setIsTaskDetailsDialogOpen}
          />
        )}
      </main>
    </>
  );
}
