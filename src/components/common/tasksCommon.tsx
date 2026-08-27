"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Pencil,
  Trash2,
  User as UserIcon,
  Ban,
  Calendar,
  AlignLeft,
  Activity,
  Flag,
  Tag,
  Folder,
  Clock,
  Save,
  Plus,
  Minus,
  X,
  GripVertical,
  Image,
  Upload,
  Download,
  DollarSign,
} from "lucide-react";
import NextImage from "next/image";
import { useState, useCallback, useEffect } from "react";
import DOMPurify from "dompurify";
import { useForm } from "react-hook-form";

import { taskCreateSchema } from "@/app/api/shared/validatorsShared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alertDialogUi";
import { Badge } from "@/components/ui/badgeUi";
import { Button } from "@/components/ui/buttonUi";
import { Calendar as CalendarComponent } from "@/components/ui/calendarUi";
import { Card, CardContent, CardHeader } from "@/components/ui/cardUi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialogUi";

import { Input } from "@/components/ui/inputUi";
import { Label } from "@/components/ui/labelUi";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popoverUi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectUi";
import { RichTextEditor } from "@/components/ui/richTextEditorUi";
import {
  cn,
  formatDate,
  getPriorityColor,
  getStatusColor,
  getRoleColor,
} from "@/components/ui/utilsUi";
import { useLanguage } from "@/contexts/languageContext";
import { useStore } from "@/contexts/storeContext";

import type { TaskInput } from "@/app/api/shared/validatorsShared";
import type { Task, User, Project, Section } from "@/types";
import { exportTaskPDF } from "@/utils/pdfUtil";
import { formatPrice, formatPricePlain } from "@/utils/pricingUtils";

interface TaskDetailsDialogProps {
  task: Task;
  users: User[];
  currentUser?: User;
  projects?: Project[];
  sections?: Section[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailsDialog({
  task,
  users,
  currentUser,
  projects,
  sections,
  open,
  onOpenChange,
}: TaskDetailsDialogProps) {
  const { t, language } = useLanguage();

  const usersArray = Array.isArray(users) ? users : [];
  const assignedUsers = usersArray.filter((u) =>
    task.assignedTo.includes(u.id),
  );

  const associatedSection =
    sections?.find((s) => s.id === task.sectionId) || null;
  const associatedProject = (() => {
    if (!sections || !projects || !task.sectionId) return undefined;
    const section = sections.find((s) => s.id === task.sectionId);
    if (!section) return undefined;
    return projects.find((p) => p.id === section.projectId);
  })();
  const handleExportPDF = () => {
    exportTaskPDF({
      task,
      section: associatedSection,
      project: associatedProject || null,
      users: usersArray,
      language,
      translations: t,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e: Event) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {language === "ar" ? task.title.ar : task.title.en}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("dashboard.tasks.card.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <button
            onClick={handleExportPDF}
            className="absolute ltr:right-16 rtl:left-16 top-4 sm:top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10 bg-background"
            title={t("common.button.downloadPDF")}
          >
            <Download className="h-5 w-5" />
            <span className="sr-only">{t("common.button.downloadPDF")}</span>
          </button>

          <div className="space-y-6 py-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <AlignLeft className="h-4 w-4" />
                {t("dashboard.tasks.card.description")}
              </h4>
              <div
                className="text-sm prose prose-sm dark:prose-invert max-w-none leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    language === "ar"
                      ? task.description.ar
                      : task.description.en,
                    {
                      FORBID_TAGS: ["style", "form", "input", "svg", "math"],
                      FORBID_ATTR: ["style", "onerror", "onload"],
                    },
                  ),
                }}
              />
            </div>

            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Image className="h-4 w-4" />
                  {t("dashboard.tasks.card.attachments")}
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {task.attachments.map((path, index) => (
                    <a
                      key={index}
                      href={`/${path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg overflow-hidden border bg-muted/50 block hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <NextImage
                        src={`/${path}`}
                        alt={`${language === "ar" ? task.title.ar : task.title.en} - ${index + 1}`}
                        width={800}
                        height={600}
                        className="w-full h-auto max-h-[400px] object-contain"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 800px"
                        unoptimized
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {associatedProject && (
                <div className="space-y-1.5 col-span-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5" />
                    {t("dashboard.projects.card.title")}
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-sm py-1 px-3 w-fit",
                      !associatedProject.color &&
                        "border-primary/20 text-primary",
                    )}
                    style={
                      associatedProject.color
                        ? {
                            borderColor: associatedProject.color,
                            color: associatedProject.color,
                          }
                        : undefined
                    }
                  >
                    {language === "ar"
                      ? associatedProject.title.ar
                      : associatedProject.title.en}
                  </Badge>
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  {t("dashboard.tasks.card.status")}
                </h4>
                <Badge
                  className={cn(
                    "text-sm py-1 px-3 w-fit",
                    getStatusColor(task.status),
                  )}
                  variant="outline"
                >
                  {t(`common.status.${task.status}`)}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5" />
                  {t("dashboard.tasks.card.priority")}
                </h4>
                <Badge
                  className={cn(
                    "text-sm py-1 px-3 w-fit",
                    getPriorityColor(task.priority),
                  )}
                  variant="outline"
                >
                  {t(`dashboard.tasks.priority.${task.priority}`)}
                </Badge>
              </div>

              {currentUser?.role === "leader" && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    {t("dashboard.tasks.card.price")}
                  </h4>
                  {(task.assigneePrices ?? []).length > 0 ? (
                    <div className="space-y-1.5">
                      {task.assigneePrices!.map((ap) => {
                        const u = usersArray.find(
                          (usr) => usr.id === ap.userId,
                        );
                        return (
                          <div
                            key={ap.userId}
                            className="flex items-center gap-3 text-sm"
                          >
                            <span className="text-muted-foreground min-w-0 truncate">
                              {u?.name || ap.userId}
                            </span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
                              {formatPrice(ap.price, language)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      $0.00
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {t("dashboard.tasks.card.createdAt")}
                </h4>
                <div className="flex items-center gap-2 text-sm font-medium bg-secondary/30 rounded px-2 py-1 w-fit">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{formatDate(task.createdAt)}</span>
                </div>
              </div>

              {task.dueDate && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("dashboard.tasks.card.dueDate")}
                  </h4>
                  <div className="flex items-center gap-2 text-sm font-medium bg-secondary/30 rounded px-2 py-1 w-fit">
                    <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 col-span-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                  <UserIcon className="h-3.5 w-3.5" />
                  {t("dashboard.tasks.form.fields.assignedTo")}
                </h4>
                {assignedUsers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {assignedUsers.map((user) => (
                      <div
                        key={user.id}
                        className={cn(
                          "flex items-center gap-2 rounded-full px-2.5 py-1 border text-xs font-medium bg-background",
                          getRoleColor(user.role),
                        )}
                      >
                        <UserIcon className="h-3.5 w-3.5" />
                        <span>{user.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                    <Ban className="h-3 w-3" />
                    {t("dashboard.tasks.card.assignee")}
                  </p>
                )}
              </div>
            </div>

            {task.tags.length > 0 && (
              <div className="space-y-1 pt-4 border-t">
                <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  {t("dashboard.tasks.card.tags")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-xs px-2.5 py-0.5 flex items-center gap-1"
                    >
                      <Tag className="h-3 w-3" />#{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

interface TaskCardProps {
  task: Task;
  users: User[];
  currentUser?: User;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: string) => void;
  onClick?: (task: Task) => void;
  isDragDisabled?: boolean;
  hideEditDelete?: boolean;
  isOverlay?: boolean;
  isListView?: boolean;
  projects?: Project[];
  sections?: Section[];
}

export function TaskCard({
  task,
  users,
  currentUser,
  onEdit,
  onDelete,
  onStatusChange: _onStatusChange,
  onClick,
  isDragDisabled,
  hideEditDelete,
  isOverlay: _isOverlay,
  isListView,
  projects,
  sections,
  hideDelete,
}: TaskCardProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, "onClick"> & {
    hideDelete?: boolean;
  }) {
  const { t, language } = useLanguage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const assignedUsers = users.filter((user) =>
    task.assignedTo.includes(user.id),
  );

  const canEdit =
    currentUser &&
    (currentUser.role === "leader" ||
      currentUser.role === "client" ||
      (task.assignedTo.includes(currentUser.id) &&
        !(currentUser.role === "member" && task.status === "done")));

  const handleClick = (e: React.MouseEvent) => {
    if (e.defaultPrevented) return;
    if (onClick) {
      onClick(task);
    }
  };

  const associatedProject = (() => {
    if (!sections || !projects || !task.sectionId) return undefined;
    const section = sections.find((s) => s.id === task.sectionId);
    if (!section) return undefined;
    return projects.find((p) => p.id === section.projectId);
  })();

  return (
    <>
      <Card
        className={`hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border hover:border-primary/50 group/card ${onClick ? "cursor-pointer" : ""} ${isListView ? "flex flex-col sm:flex-row items-start sm:items-center p-3 sm:p-2 h-auto gap-3 sm:gap-4" : ""} ${_isOverlay ? "!border-0 ring-2 ring-primary shadow-2xl" : ""}`}
        onClick={handleClick}
      >
        <div
          className={cn(
            "flex-1 w-full",
            isListView &&
              "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0",
          )}
        >
          <CardHeader
            className={cn(isListView ? "p-0 w-full sm:flex-1 min-w-0" : "pb-3")}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0 overflow-hidden">
                {!isListView && !isDragDisabled && (
                  <div className="opacity-0 group-hover/card:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing text-muted-foreground shrink-0 ltr:-ml-6 rtl:-mr-6 group-hover/card:ltr:ml-0 group-hover/card:rtl:mr-0">
                    <GripVertical className="h-4 w-4" />
                  </div>
                )}
                <h4
                  className={cn(
                    "font-semibold text-sm transition-all duration-200",
                    task.status === "done"
                      ? "line-through text-muted-foreground"
                      : "",
                    !isListView &&
                      !isDragDisabled &&
                      "group-hover/card:ltr:ml-2 group-hover/card:rtl:mr-2",
                  )}
                >
                  {language === "ar" ? task.title.ar : task.title.en}
                </h4>
              </div>
              {!isListView && !hideEditDelete && (
                <div className="flex items-center gap-1 shrink-0">
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(task);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {currentUser &&
                    currentUser.role !== "member" &&
                    !hideDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent
            className={cn(
              isListView
                ? "p-0 flex flex-wrap xl:flex-nowrap items-center gap-2 xl:gap-3 w-full xl:w-auto"
                : "pb-3",
            )}
          >
            {associatedProject && !_isOverlay && (
              <div className={cn(isListView ? "" : "mb-3")}>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    !associatedProject.color &&
                      "border-primary/20 text-primary",
                  )}
                  style={
                    associatedProject.color
                      ? {
                          borderColor: associatedProject.color,
                          color: associatedProject.color,
                        }
                      : undefined
                  }
                >
                  <Folder className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                  {language === "ar"
                    ? associatedProject.title.ar
                    : associatedProject.title.en}
                </Badge>
              </div>
            )}

            <div
              className={cn(
                "flex items-center gap-2",
                isListView ? "" : "mb-3",
              )}
            >
              <Badge className={getStatusColor(task.status)} variant="outline">
                <Activity className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                {t(`common.status.${task.status}`)}
              </Badge>
              <Badge
                className={getPriorityColor(task.priority)}
                variant="outline"
              >
                <Flag className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                {t(`dashboard.tasks.priority.${task.priority}`)}
              </Badge>
              {(task.assigneePrices ?? []).reduce((s, ap) => s + ap.price, 0) >
                0 && (
                <Badge
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  variant="outline"
                >
                  <DollarSign className="ltr:mr-1 rtl:ml-1 h-3 w-3" />
                  {formatPrice(
                    (task.assigneePrices ?? []).reduce(
                      (s, ap) => s + ap.price,
                      0,
                    ),
                    language,
                  )}
                </Badge>
              )}
            </div>

            {(task.createdAt || (task.dueDate && task.dueDate !== "")) && (
              <div
                className={cn(
                  "flex items-center gap-2 text-xs text-muted-foreground",
                  isListView ? "" : "mb-2",
                )}
              >
                {task.createdAt && (
                  <div
                    className="flex items-center gap-1"
                    title={t("dashboard.tasks.card.createdAt")}
                  >
                    <Clock className="h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span className="whitespace-nowrap">
                      {formatDate(task.createdAt)}
                    </span>
                  </div>
                )}
                {task.createdAt && task.dueDate && <span>-</span>}
                {task.dueDate && task.dueDate !== "" && (
                  <div
                    className="flex items-center gap-1"
                    title={t("dashboard.tasks.card.dueDate")}
                  >
                    <Calendar className="h-3 w-3 shrink-0 text-orange-600 dark:text-orange-400" />
                    <span className="whitespace-nowrap">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {assignedUsers.length > 0 && (
              <div
                className={cn("flex flex-wrap gap-1", isListView ? "" : "mt-2")}
              >
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-1.5 py-0.5 border text-[10px] font-medium bg-background whitespace-nowrap",
                      getRoleColor(user.role),
                    )}
                  >
                    <UserIcon className="h-3 w-3" />
                    <span>{user.name}</span>
                  </div>
                ))}
              </div>
            )}
            {isListView && !hideEditDelete && (
              <div className="flex items-center gap-1 ml-auto shrink-0">
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                {currentUser &&
                  currentUser.role !== "member" &&
                  !hideDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            )}
          </CardContent>

          {!isListView && task.tags && task.tags.length > 0 && (
            <CardContent className="pt-2 pb-3 border-t">
              <div className="flex flex-wrap gap-1 w-full justify-start">
                {task.tags.slice(0, 3).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{task.tags.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          )}
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          onPointerDownOutside={(e: Event) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.tasks.modals.delete.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.tasks.modals.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 pt-4">
            <AlertDialogAction
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete(task.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700 flex-1"
            >
              <Trash2 className="h-4 w-4" />
              {t("common.button.delete")}
            </AlertDialogAction>
            <AlertDialogCancel
              className="mt-0"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                setShowDeleteDialog(false);
              }}
            >
              <Ban className="h-4 w-4" />
              {t("common.button.cancel")}
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export interface TaskFormProps {
  task?: Task;
  sectionId?: string;
  users: User[];
  onSubmit: (data: TaskInput, files?: File[]) => void;
  onCancel: () => void;
  currentUser?: User;
  showStatusOnly?: boolean;
}

export function TaskForm({
  task,
  sectionId,
  users,
  onSubmit,
  onCancel,
  currentUser,
  showStatusOnly,
}: TaskFormProps) {
  const { t, language } = useLanguage();
  const { tasks } = useStore();

  const isRestrictedView =
    !!task && !!currentUser && currentUser.role === "member";
  const isClient = !!currentUser && currentUser.role === "client";

  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    task?.assignedTo || [],
  );
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined,
  );

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>(
    task?.attachments || [],
  );
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const effectiveSectionId = sectionId || task?.sectionId || "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<TaskInput>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      title: task?.title || { en: "", ar: "" },
      description: task?.description || { en: "", ar: "" },
      status: task?.status || "todo",
      assignedTo: task?.assignedTo || [],
      dueDate: task?.dueDate || "",
      priority: task?.priority || "low",
      sectionId: effectiveSectionId,
      tags: task?.tags || [],
      attachments: task?.attachments || [],
      assigneePrices: task?.assigneePrices || [],
    },
  });

  const removeExistingAttachment = (index: number) => {
    const newAttachments = existingAttachments.filter((_, i) => i !== index);
    setExistingAttachments(newAttachments);
    setValue("attachments", newAttachments);
  };

  const handleMemberToggle = (memberId: string) => {
    const newMembers = selectedMembers.includes(memberId)
      ? selectedMembers.filter((id) => id !== memberId)
      : [...selectedMembers, memberId];
    setSelectedMembers(newMembers);
    setValue("assignedTo", newMembers);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue("tags", newTags);
      setTagInput("");
    }
  };

  const status = watch("status");
  const priority = watch("priority");
  const watchAssigneePrices: { userId: string; price: number }[] =
    watch("assigneePrices") || [];

  const setAssigneePrice = (userId: string, delta: number) => {
    const current =
      watchAssigneePrices.find((ap) => ap.userId === userId)?.price ?? 0;
    const newPrice = Math.max(0, current + delta);
    setValue(
      "assigneePrices",
      [
        ...watchAssigneePrices.filter((ap) => ap.userId !== userId),
        { userId, price: newPrice },
      ],
      { shouldDirty: true },
    );
  };

  const getAssigneePrice = (userId: string): number =>
    watchAssigneePrices.find((ap) => ap.userId === userId)?.price ?? 0;

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const getFilteredTags = useCallback(
    (input: string) => {
      const allTags = Array.from(new Set(tasks.flatMap((t) => t.tags || [])));
      return allTags
        .filter(
          (tag) => !input || tag.toLowerCase().includes(input.toLowerCase()),
        )
        .filter((tag) => !tags.includes(tag))
        .slice(0, 10);
    },
    [tasks, tags],
  );

  const onFormSubmit = (data: TaskInput) => {
    const finalData = {
      ...data,
      assignedTo: selectedMembers,
      tags: tags,
      attachments: existingAttachments,
    };
    onSubmit(finalData, imageFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setImageFiles((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setImageFiles((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col flex-1 min-h-0"
    >
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain space-y-4 -mx-4 sm:-mx-6 px-4 sm:px-6 -mb-4 sm:-mb-6 pb-4 sm:pb-6 relative z-0">
        {!showStatusOnly && !isRestrictedView && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title-en">
                {t("dashboard.tasks.form.fields.titleEn")}
              </Label>
              <Input id="title-en" dir="ltr" {...register("title.en")} />
              {errors.title?.en && (
                <p className="text-sm text-red-600 mt-1">
                  {t("dashboard.tasks.validation.titleMinEn")}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="title-ar">
                {t("dashboard.tasks.form.fields.titleAr")}
              </Label>
              <Input id="title-ar" dir="rtl" {...register("title.ar")} />
              {errors.title?.ar && (
                <p className="text-sm text-red-600 mt-1">
                  {t("dashboard.tasks.validation.titleMinAr")}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description-en">
                {t("dashboard.tasks.form.fields.descriptionEn")}
              </Label>
              <RichTextEditor
                content={watch("description.en")}
                onChange={(content) =>
                  setValue("description.en", content, { shouldDirty: true })
                }
                dir="ltr"
              />
              {errors.description?.en && (
                <p className="text-sm text-red-600 mt-1">
                  {t("dashboard.tasks.validation.descriptionMin")}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="description-ar">
                {t("dashboard.tasks.form.fields.descriptionAr")}
              </Label>
              <RichTextEditor
                content={watch("description.ar")}
                onChange={(content) =>
                  setValue("description.ar", content, { shouldDirty: true })
                }
                dir="rtl"
              />
              {errors.description?.ar && (
                <p className="text-sm text-red-600 mt-1">
                  {t("dashboard.tasks.validation.descriptionMin")}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label>{t("dashboard.tasks.form.fields.attachments")}</Label>
              {existingAttachments.length > 0 || previews.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {existingAttachments.map((url, index) => (
                      <div
                        key={`existing-${index}`}
                        className="grid [grid-template-areas:'stack'] rounded-lg overflow-hidden border bg-muted/50 group"
                      >
                        <NextImage
                          src={`/${url}`}
                          alt="Attachment"
                          width={200}
                          height={200}
                          className="[grid-area:stack] w-full h-32 object-cover"
                          loading="lazy"
                          sizes="(max-width: 768px) 50vw, 200px"
                          unoptimized
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="[grid-area:stack] place-self-start self-start mt-2 ltr:justify-self-end ltr:mr-2 rtl:justify-self-start rtl:ml-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExistingAttachment(index);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    {previews.map((url, index) => (
                      <div
                        key={`new-${index}`}
                        className="grid [grid-template-areas:'stack'] rounded-lg overflow-hidden border bg-muted/50 group"
                      >
                        <NextImage
                          src={url}
                          alt="Preview"
                          width={200}
                          height={200}
                          className="[grid-area:stack] w-full h-32 object-cover"
                          unoptimized
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="[grid-area:stack] place-self-start self-start mt-2 ltr:justify-self-end ltr:mr-2 rtl:justify-self-start rtl:ml-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNewFile(index);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    <Plus className="h-4 w-4" />
                    {t("dashboard.tasks.form.actions.addMore")}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </>
              ) : (
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50",
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <div className="text-sm">
                      <span className="font-semibold text-primary">
                        {t("dashboard.tasks.form.upload.click")}
                      </span>{" "}
                      {t("dashboard.tasks.form.upload.dragDrop")}
                    </div>
                    <p className="text-xs text-muted-foreground/70">
                      {t("dashboard.tasks.form.upload.fileTypes")}
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {!isClient && (
          <div
            className={`grid gap-4 ${isRestrictedView || showStatusOnly ? "grid-cols-1" : "grid-cols-2"}`}
          >
            <div className="space-y-1">
              <Label htmlFor="status">
                {t("dashboard.tasks.form.fields.status")}
              </Label>
              <Select
                value={status}
                onValueChange={(value: string) =>
                  setValue(
                    "status",
                    value as "todo" | "in_progress" | "in_review" | "done",
                  )
                }
                disabled={isClient}
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                <SelectTrigger
                  className={!status ? "text-muted-foreground" : ""}
                  dir={language === "ar" ? "rtl" : "ltr"}
                >
                  <SelectValue
                    placeholder={t("dashboard.tasks.placeholders.selectStatus")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">
                    {t("common.status.todo")}
                  </SelectItem>
                  <SelectItem value="in_progress">
                    {t("common.status.in_progress")}
                  </SelectItem>
                  <SelectItem value="in_review">
                    {t("common.status.in_review")}
                  </SelectItem>
                  {currentUser?.role !== "member" && (
                    <SelectItem value="done">
                      {t("common.status.done")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600 mt-1">
                  {t("common.validation.required")}
                </p>
              )}
            </div>

            {!showStatusOnly && !isRestrictedView && (
              <div className="space-y-1">
                <Label htmlFor="priority">
                  {t("dashboard.tasks.card.priority")}
                </Label>
                <Select
                  value={priority}
                  onValueChange={(value: string) =>
                    setValue(
                      "priority",
                      value as "low" | "medium" | "high" | "urgent",
                    )
                  }
                  dir={language === "ar" ? "rtl" : "ltr"}
                >
                  <SelectTrigger
                    className={!priority ? "text-muted-foreground" : ""}
                    dir={language === "ar" ? "rtl" : "ltr"}
                  >
                    <SelectValue
                      placeholder={t(
                        "dashboard.tasks.placeholders.selectPriority",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      {t("dashboard.tasks.priority.low")}
                    </SelectItem>
                    <SelectItem value="medium">
                      {t("dashboard.tasks.priority.medium")}
                    </SelectItem>
                    <SelectItem value="high">
                      {t("dashboard.tasks.priority.high")}
                    </SelectItem>
                    <SelectItem value="urgent">
                      {t("dashboard.tasks.priority.urgent")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-red-600 mt-1">
                    {t("common.validation.required")}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {!showStatusOnly && !isRestrictedView && !isClient && (
          <div className="space-y-1">
            <Label>{t("dashboard.tasks.form.fields.dueDate")}</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal flex-1",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", {
                        locale: language === "ar" ? ar : undefined,
                      })
                    ) : (
                      <span>
                        {t("dashboard.tasks.placeholders.selectDate")}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setValue("dueDate", date ? date.toISOString() : "");
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  setSelectedDate(undefined);
                  setValue("dueDate", "");
                }}
                disabled={!selectedDate}
                title={t("common.button.clear")}
              >
                <span className="sr-only">Clear</span>
                <span aria-hidden="true">✕</span>
              </Button>
            </div>
            <input type="hidden" {...register("dueDate")} />
            {errors.dueDate && (
              <p className="text-sm text-red-600 mt-1">
                {t("common.validation.required")}
              </p>
            )}
          </div>
        )}

        {!showStatusOnly && !isRestrictedView && !isClient && (
          <div className="space-y-1">
            <Label>{t("dashboard.tasks.card.assignee")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-start h-auto min-h-[40px] px-3 py-2"
                >
                  {selectedMembers.length === 0 ? (
                    <span className="text-muted-foreground font-normal">
                      {t("dashboard.tasks.placeholders.selectMembers")}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {users
                        .filter((u) => selectedMembers.includes(u.id))
                        .map((user) => (
                          <Badge
                            key={user.id}
                            variant="secondary"
                            className={`text-xs ${
                              user.role === "leader"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                                : user.role === "client"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-300 dark:border-blue-800"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-400 border-slate-300 dark:border-slate-800"
                            }`}
                          >
                            {user.name}
                          </Badge>
                        ))}
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                side="top"
                sideOffset={8}
              >
                <div className="max-h-80 overflow-auto p-2">
                  {users.filter((u) => u.role !== "client").length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      {t("dashboard.team.list.noMembers")}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {users
                        .filter((u) => u.role !== "client")
                        .map((user) => {
                          const getIconColor = (role: string) => {
                            switch (role) {
                              case "leader":
                                return "text-emerald-600 dark:text-emerald-400";
                              case "client":
                                return "text-blue-600 dark:text-blue-400";
                              case "member":
                                return "text-slate-600 dark:text-slate-400";
                              default:
                                return "text-gray-600 dark:text-gray-400";
                            }
                          };
                          return (
                            <div
                              key={user.id}
                              className={`flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer transition-colors ${selectedMembers.includes(user.id) ? "bg-muted" : ""}`}
                              onClick={() => handleMemberToggle(user.id)}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <UserIcon
                                  className={`h-5 w-5 ${getIconColor(user.role)} shrink-0`}
                                />
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="font-medium text-sm truncate">
                                    {user.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {t(`common.role.${user.role}`)}
                                  </span>
                                </div>
                              </div>
                              {selectedMembers.includes(user.id) && (
                                <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {currentUser?.role === "leader" &&
          !showStatusOnly &&
          selectedMembers.length > 0 && (
            <div className="space-y-1 mt-4">
              <Label>{t("dashboard.tasks.card.price")}</Label>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {selectedMembers.map((memberId) => {
                      const memberUser = users.find((u) => u.id === memberId);
                      const price = getAssigneePrice(memberId);
                      return (
                        <tr key={memberId} className="border-b last:border-b-0">
                          <td className="py-1.5 px-3 w-px whitespace-nowrap">
                            <span className="text-xs text-muted-foreground block ltr:text-left rtl:text-right">
                              {memberUser?.name || memberId}
                            </span>
                          </td>
                          <td className="py-1.5 px-3">
                            <div
                              className={cn(
                                "w-full flex items-center rounded-md border border-input bg-transparent shadow-sm transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:border-primary",
                              )}
                            >
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none rounded-l-md border-0 hover:bg-muted"
                                onClick={() => setAssigneePrice(memberId, -5)}
                                disabled={price <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <div className="px-2 flex-1 text-center font-medium text-sm text-emerald-700 dark:text-emerald-400 tabular-nums select-none">
                                {formatPricePlain(price)}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none rounded-r-md border-0 hover:bg-muted"
                                onClick={() => setAssigneePrice(memberId, 5)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {!showStatusOnly && !isRestrictedView && !isClient && (
          <div className="space-y-1 mb-6">
            <Label>{t("dashboard.tasks.form.fields.tags")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-normal h-auto min-h-10 py-2"
                  type="button"
                  dir={language === "ar" ? "rtl" : "ltr"}
                >
                  {tags.length === 0 ? (
                    <span className="text-muted-foreground">
                      {t("dashboard.tasks.placeholders.addTag")}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1 flex-1">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0"
                align="start"
                side="top"
                sideOffset={8}
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                <div className="p-3 border-b space-y-1">
                  <Label>{t("dashboard.tasks.form.fields.addTag")}</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-60 overflow-auto p-2">
                  {tags.length > 0 && (
                    <div className="space-y-1">
                      {tags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
                        >
                          <span className="text-sm">{tag}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  {getFilteredTags(tagInput).length > 0 && (
                    <div className="space-y-1">
                      {getFilteredTags(tagInput).map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                          onClick={() => {
                            const newTags = [...tags, tag];
                            setTags(newTags);
                            setValue("tags", newTags);
                            setTagInput("");
                          }}
                        >
                          <span className="text-sm">{tag}</span>
                          <Plus className="h-3 w-3 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                  {tags.length === 0 &&
                    getFilteredTags(tagInput).length === 0 && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        {t("dashboard.tasks.list.noTags")}
                      </div>
                    )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      <div className="flex gap-2 pt-4 shrink-0 relative z-10 bg-background border-t">
        <Button type="submit" className="flex-1">
          {task ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {task ? t("common.button.update") : t("common.button.create")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          <Ban className="h-4 w-4" />
          {t("common.button.cancel")}
        </Button>
      </div>
    </form>
  );
}
