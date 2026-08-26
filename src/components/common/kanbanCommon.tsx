"use client";

import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useEffect, useCallback, memo, useRef } from "react";
import toast from "react-hot-toast";

import { TaskCard } from "@/components/common/tasksCommon";
import { Badge } from "@/components/ui/badgeUi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cardUi";
import { cn } from "@/components/ui/utilsUi";
import { useLanguage } from "@/contexts/languageContext";
import { calculateColumnTotal, formatPrice } from "@/utils/pricingUtils";

import type { TaskStatus, User, Project, Task, Section } from "@/types";
import type {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
} from "@dnd-kit/core";

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  currentUser: User;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  projects?: Project[];
  sections?: Section[];
  hideDelete?: boolean;
}

const getColumns = (
  _t: (key: string) => string,
): { id: TaskStatus; titleKey: string; color: string }[] => [
  {
    id: "todo",
    titleKey: "common.status.todo",
    color: "bg-slate-100 dark:bg-slate-800/50",
  },
  {
    id: "in_progress",
    titleKey: "common.status.in_progress",
    color: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "in_review",
    titleKey: "common.status.in_review",
    color: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: "done",
    titleKey: "common.status.done",
    color: "bg-emerald-100 dark:bg-emerald-900/30",
  },
];

function DroppableColumn({
  column,
  children,
}: {
  column: { id: TaskStatus; titleKey: string; color: string };
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full transition-all duration-200 rounded-lg",
        isOver && "bg-primary/5",
      )}
    >
      {children}
    </div>
  );
}

const SortableTaskItem = ({
  task,
  users,
  currentUser,
  onTaskClick,
  onEdit,
  onDelete,
  isDragDisabled,
  handleStatusChange,
  projects,
  sections,
  hideEditDelete,
  hideDelete,
}: {
  task: Task;
  users: User[];
  currentUser: User;
  onTaskClick?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isDragDisabled: boolean;
  handleStatusChange: (taskId: string, newStatus: string) => void;
  projects?: Project[];
  sections?: Section[];
  hideEditDelete?: boolean;
  hideDelete?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragDisabled ? "default" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative transition-all duration-200",
        isDragging && "opacity-50 shadow-2xl z-50",
        !isDragDisabled && "hover:shadow-lg",
      )}
    >
      <TaskCard
        task={task}
        users={users}
        currentUser={currentUser}
        isDragDisabled={isDragDisabled}
        onStatusChange={handleStatusChange}
        onClick={onTaskClick}
        onEdit={onEdit || (() => {})}
        onDelete={onDelete || (() => {})}
        hideEditDelete={hideEditDelete || isDragging}
        hideDelete={hideDelete}
        projects={projects}
        sections={sections}
      />
    </div>
  );
};

const KanbanBoard = memo(function KanbanBoard({
  tasks,
  users,
  currentUser,
  onTaskUpdate,
  onTaskClick,
  onEdit,
  onDelete,
  projects,
  sections,
  hideDelete,
}: KanbanBoardProps) {
  const { t, language } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const localTasksRef = useRef<Task[]>(tasks);

  const columns = getColumns(t);

  useEffect(() => {
    localTasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isTaskDragDisabled = (task: Task) => {
    if (isMobile) return true;
    if (currentUser.role === "leader") return false;

    if (currentUser.role === "member") {
      if (task.status === "done") return true;
      if (task.assignedTo.includes(currentUser.id)) return false;
      return true;
    }
    return true;
  };

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
    const task = tasks.find((t) => t.id === event.active.id);
    if (!task || isTaskDragDisabled(task)) {
      return;
    }
    setActiveId(event.active.id as string);

    if (typeof window !== "undefined") {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask || isTaskDragDisabled(activeTask)) return;

    const overIdStr = overId.toString();
    let newStatus: TaskStatus | null = null;
    let overTaskId: string | null = null;

    if (overIdStr.startsWith("column-")) {
      newStatus = overIdStr.replace("column-", "") as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
        overTaskId = overTask.id;
      }
    }

    if (!newStatus) return;

    if (currentUser.role === "client") return;
    if (currentUser.role === "member" && newStatus === "done") return;

    if (activeTask.status !== newStatus) {
      const newColumnTasks = tasks.filter(
        (t) => t.status === newStatus && t.id !== activeTask.id,
      );

      let newOrder: number;
      if (overTaskId) {
        const overTask = tasks.find((t) => t.id === overTaskId);
        if (overTask) {
          newOrder = overTask.order ?? 0;
          const updatedTasks = newColumnTasks.map((t) => ({
            ...t,
            order: (t.order ?? 0) >= newOrder ? (t.order ?? 0) + 1 : t.order,
          }));
          const newTasks = tasks.map((t) =>
            t.id === activeTask.id
              ? { ...t, status: newStatus, order: newOrder }
              : updatedTasks.find((ut) => ut.id === t.id) || t,
          );
          localTasksRef.current = newTasks;
          return;
        }
      }

      const maxOrder =
        newColumnTasks.length > 0
          ? Math.max(...newColumnTasks.map((t) => t.order ?? 0))
          : -1;
      newOrder = maxOrder + 1;

      const newTasks = tasks.map((t) =>
        t.id === activeTask.id
          ? { ...t, status: newStatus, order: newOrder }
          : t,
      );
      localTasksRef.current = newTasks;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (typeof window !== "undefined") {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
      });
    }

    setActiveId(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask || isTaskDragDisabled(activeTask)) return;

    const overIdStr = overId.toString();
    let newStatus: TaskStatus | null = null;
    let overTaskId: string | null = null;

    if (overIdStr.startsWith("column-")) {
      newStatus = overIdStr.replace("column-", "") as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
        overTaskId = overTask.id;
      }
    }

    if (!newStatus) return;

    if (currentUser.role === "client") {
      return;
    }

    if (currentUser.role === "member" && newStatus === "done") {
      return;
    }

    if (activeTask.status !== newStatus) {
      const newColumnTasks = tasks.filter(
        (t) => t.status === newStatus && t.id !== activeTask.id,
      );

      const maxOrder =
        newColumnTasks.length > 0
          ? Math.max(...newColumnTasks.map((t) => t.order ?? 0))
          : -1;
      const newOrder = maxOrder + 1;

      const newTasks = tasks.map((t) =>
        t.id === activeTask.id
          ? { ...t, status: newStatus, order: newOrder }
          : t,
      );
      localTasksRef.current = newTasks;
      onTaskUpdate(activeTask.id, { status: newStatus, order: newOrder });
    } else if (overTaskId) {
      const columnTasks = tasks.filter((t) => t.status === activeTask.status);
      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);

      if (activeIndex !== overIndex) {
        const reorderedColumn = arrayMove(columnTasks, activeIndex, overIndex);
        const otherTasks = tasks.filter((t) => t.status !== activeTask.status);

        const tasksWithOrder = reorderedColumn.map((task, index) => ({
          ...task,
          order: index,
        }));

        localTasksRef.current = [...otherTasks, ...tasksWithOrder];

        const updates = tasksWithOrder.map((task, index) => ({
          id: task.id,
          order: index,
        }));

        fetch("/api/tasks/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        })
          .then((response) => {
            if (!response.ok) {
              toast.error(t("common.apiErrors.failedToUpdateTaskOrder"));
            }
          })
          .catch(() => {
            toast.error(t("common.apiErrors.failedToUpdateTaskOrder"));
          });
      }
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const handleStatusChange = useCallback(
    (taskId: string, newStatus: string) => {
      onTaskUpdate(taskId, { status: newStatus as TaskStatus });
    },
    [onTaskUpdate],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {columns.map((column, _index) => {
          const columnTasks = getTasksByStatus(column.id);

          return (
            <div
              key={column.id}
              className={`
                  ${column.id === "done" ? "lg:col-span-3 xl:col-span-1" : ""}
                `}
            >
              <DroppableColumn column={column}>
                <Card className="flex flex-col">
                  <CardHeader className={`${column.color} rounded-t-lg`}>
                    <CardTitle className="flex items-center justify-between text-base text-gray-800 dark:text-gray-100">
                      {t(column.titleKey)}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                          {formatPrice(
                            calculateColumnTotal(columnTasks, column.id),
                            language,
                          )}
                        </span>
                        <Badge
                          variant="secondary"
                          className="dark:bg-gray-700 dark:text-gray-100"
                        >
                          {columnTasks.length}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3 min-h-[200px]">
                    <SortableContext
                      items={columnTasks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {columnTasks.map((task) => (
                        <SortableTaskItem
                          key={task.id}
                          task={task}
                          users={users}
                          currentUser={currentUser}
                          isDragDisabled={isTaskDragDisabled(task)}
                          handleStatusChange={handleStatusChange}
                          onTaskClick={onTaskClick}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          projects={projects}
                          sections={sections}
                          hideEditDelete={!isMobile}
                          hideDelete={hideDelete}
                        />
                      ))}
                    </SortableContext>

                    {columnTasks.length === 0 && (
                      <div className="flex items-center justify-center text-center text-muted-foreground text-sm h-full">
                        {t("dashboard.tasks.list.noTasks")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="opacity-90 rotate-2 scale-105 cursor-grabbing shadow-2xl">
            <TaskCard
              task={activeTask}
              users={users}
              currentUser={currentUser}
              isOverlay={true}
              projects={projects}
              sections={sections}
              onEdit={() => {}}
              onDelete={() => {}}
              onStatusChange={() => {}}
              hideEditDelete={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
});

export { KanbanBoard };
