"use client";

import { useState, useEffect, memo } from "react";

import {
  UserPlus,
  Trash2,
  Edit,
  Mail,
  Shield,
  Search,
  User as UserIcon,
  Ban,
  Eye,
  EyeOff,
  Lock,
  Save,
  Plus,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alertDialogUi";
import { Button } from "@/components/ui/buttonUi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/cardUi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
} from "@/components/ui/dialogUi";
import { Input } from "@/components/ui/inputUi";
import { Label } from "@/components/ui/labelUi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectUi";
import { cn, getRoleColor } from "@/components/ui/utilsUi";
import { useLanguage } from "@/contexts/languageContext";

import type { User, UserRole } from "@/types";

export interface MemberInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface MemberUpdates extends Partial<Omit<User, "id">> {
  password?: string;
}

interface MembersManagementProps {
  users: User[];
  currentUser: User;
  onAddMember: (member: MemberInput) => Promise<boolean>;
  onUpdateMember: (id: string, updates: MemberUpdates) => Promise<boolean>;
  onDeleteMember: (id: string) => Promise<void>;
  onReorderMembers?: (
    updates: { id: string; order: number }[],
  ) => Promise<void>;
}

function DroppableRoleGroup({
  role,
  children,
  title,
}: {
  role: UserRole;
  children: React.ReactNode;
  title: string;
}) {
  const { setNodeRef } = useDroppable({
    id: `role-${role}`,
  });

  return (
    <div ref={setNodeRef} className="space-y-4 p-4 rounded-lg">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            role === "leader"
              ? "bg-emerald-500"
              : role === "client"
                ? "bg-blue-500"
                : "bg-slate-500"
          }`}
        />
        {title}
      </h3>
      {children}
    </div>
  );
}

const SortableMemberCard = memo(function SortableMemberCard({
  user,
  currentUser,
  onEditClick,
  onDeleteMember,
  isDragDisabled,
  t,
}: {
  user: User;
  currentUser: User;
  onEditClick: (user: User) => void;
  onDeleteMember: (id: string) => Promise<void>;
  isDragDisabled: boolean;
  t: (key: string) => string;
  isActive?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: user.id,
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
      className={cn(
        "w-full min-w-0 transition-all duration-200",
        isDragging && "opacity-50",
        !isDragDisabled && "hover:shadow-lg",
      )}
    >
      <Card
        className={`relative group/member overflow-hidden w-full ${isDragging ? "shadow-2xl" : "hover:border-primary/50"}`}
      >
        <CardHeader className="pb-3 px-4">
          <div className="flex items-center gap-3">
            {!isDragDisabled && (
              <div
                className="opacity-0 group-hover/member:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing text-muted-foreground shrink-0 ltr:-ml-6 rtl:-mr-6 group-hover/member:ltr:ml-0 group-hover/member:rtl:mr-0"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br shrink-0 ${
                  user.role === "leader"
                    ? "from-emerald-500 to-emerald-600"
                    : user.role === "client"
                      ? "from-blue-500 to-blue-600"
                      : "from-slate-500 to-slate-600"
                }`}
              >
                <UserIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <CardTitle className="text-base truncate overflow-hidden text-ellipsis">
                  {user.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate overflow-hidden text-ellipsis">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <div className="flex items-center justify-between">
            <div
              className={cn(
                "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold pointer-events-none",
                getRoleColor(user.role),
              )}
            >
              <Shield className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
              {t(`common.role.${user.role}`)}
            </div>
          </div>

          {user.id !== currentUser.id && currentUser.role === "leader" && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick(user);
                }}
              >
                <Edit className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                {t("common.button.edit")}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t("common.button.delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  onPointerDownOutside={(e: Event) => e.preventDefault()}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("dashboard.team.modals.delete.title")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("dashboard.team.modals.delete.description")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-2 pt-4">
                    <AlertDialogAction
                      onClick={() => onDeleteMember(user.id)}
                      className="bg-red-600 hover:bg-red-700 flex-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("common.button.delete")}
                    </AlertDialogAction>
                    <AlertDialogCancel className="mt-0">
                      <Ban className="h-4 w-4" />
                      {t("common.button.cancel")}
                    </AlertDialogCancel>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export function MembersManagement({
  users,
  currentUser,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onReorderMembers,
}: MembersManagementProps) {
  const { t, language } = useLanguage();
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    if (currentUser.role !== "leader" || isMobile) return;
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || currentUser.role !== "leader") return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeUser = localUsers.find((u) => u.id === activeId);
    if (!activeUser) return;

    const overIdStr = overId.toString();
    let newRole: UserRole | null = null;
    let overUserId: string | null = null;

    if (overIdStr.startsWith("role-")) {
      newRole = overIdStr.replace("role-", "") as UserRole;
    } else {
      const overUser = localUsers.find((u) => u.id === overId);
      if (overUser) {
        newRole = overUser.role;
        overUserId = overUser.id;
      }
    }

    if (!newRole) return;

    if (activeUser.role !== newRole) {
      const roleUsers = localUsers.filter((u) => u.role === newRole);
      const maxOrder =
        roleUsers.length > 0
          ? Math.max(...roleUsers.map((u) => u.order ?? 0))
          : -1;
      const newOrder = maxOrder + 1;

      const newUsers = localUsers.map((u) =>
        u.id === activeUser.id ? { ...u, role: newRole, order: newOrder } : u,
      );
      setLocalUsers(newUsers);
      return;
    }

    if (overUserId && activeUser.id !== overUserId) {
      const roleUsers = localUsers
        .filter((u) => u.role === activeUser.role)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const activeIndex = roleUsers.findIndex((u) => u.id === activeId);
      const overIndex = roleUsers.findIndex((u) => u.id === overUserId);

      if (activeIndex !== overIndex) {
        const reordered = arrayMove(roleUsers, activeIndex, overIndex);
        const otherUsers = localUsers.filter((u) => u.role !== activeUser.role);

        const usersWithOrder = reordered.map((user, index) => ({
          ...user,
          order: index,
        }));

        setLocalUsers([...otherUsers, ...usersWithOrder]);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || currentUser.role !== "leader") return;

    const activeId = active.id;
    const overId = over.id;

    const activeUser = localUsers.find((u) => u.id === activeId);
    if (!activeUser) return;

    const overIdStr = overId.toString();
    let newRole: UserRole | null = null;
    let overUserId: string | null = null;

    if (overIdStr.startsWith("role-")) {
      newRole = overIdStr.replace("role-", "") as UserRole;
    } else {
      const overUser = localUsers.find((u) => u.id === overId);
      if (overUser) {
        newRole = overUser.role;
        overUserId = overUser.id;
      }
    }

    if (!newRole) return;

    if (activeUser.role !== newRole) {
      const roleUsers = localUsers.filter((u) => u.role === newRole);
      const maxOrder =
        roleUsers.length > 0
          ? Math.max(...roleUsers.map((u) => u.order ?? 0))
          : -1;
      const newOrder = maxOrder + 1;

      const newUsers = localUsers.map((u) =>
        u.id === activeUser.id ? { ...u, role: newRole!, order: newOrder } : u,
      );
      setLocalUsers(newUsers);

      const ok = await onUpdateMember(activeUser.id, {
        role: newRole,
        order: newOrder,
      });
      if (!ok) {
        setLocalUsers(users);
      }
    } else if (overUserId && activeUser.id !== overUserId) {
      const roleUsers = localUsers
        .filter((u) => u.role === activeUser.role)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const activeIndex = roleUsers.findIndex((u) => u.id === activeId);
      const overIndex = roleUsers.findIndex((u) => u.id === overUserId);

      if (activeIndex !== overIndex) {
        const reordered = arrayMove(roleUsers, activeIndex, overIndex);
        const otherUsers = localUsers.filter((u) => u.role !== activeUser.role);

        const usersWithOrder = reordered.map((user, index) => ({
          ...user,
          order: index,
        }));

        setLocalUsers([...otherUsers, ...usersWithOrder]);

        const updates = usersWithOrder.map((user, index) => ({
          id: user.id,
          order: index,
        }));

        if (onReorderMembers) {
          await onReorderMembers(updates);
        }
      }
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as UserRole,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editPassword, setEditPassword] = useState("");

  const usersArray = Array.isArray(localUsers) ? localUsers : [];
  const filteredUsers = usersArray.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getSortedGroup = (role: UserRole) => {
    return filteredUsers
      .filter((u) => u.role === role)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const groupedUsers = {
    leader: getSortedGroup("leader"),
    client: getSortedGroup("client"),
    member: getSortedGroup("member"),
  };

  const handleAddMember = async () => {
    const newErrors: Record<string, string> = {};
    if (!newMember.name) newErrors.name = t("common.validation.required");
    if (!newMember.email) newErrors.email = t("common.validation.required");
    if (!newMember.password)
      newErrors.password = t("common.validation.required");
    if (!newMember.role) newErrors.role = t("common.validation.required");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const ok = await onAddMember(newMember);
    if (ok) {
      setNewMember({ name: "", email: "", password: "", role: "" as UserRole });
      setIsAddDialogOpen(false);
    }
  };

  const onEditClick = (user: User) => {
    setEditingMember(user);
    setEditPassword("");
    setEditErrors({});
    setIsEditMemberDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingMember) return;

    const newErrors: Record<string, string> = {};
    if (!editingMember.name || editingMember.name.trim() === "") {
      newErrors.name = t("common.validation.required");
    }
    if (!editingMember.email || editingMember.email.trim() === "") {
      newErrors.email = t("common.validation.required");
    }
    if (!editingMember.role) {
      newErrors.role = t("common.validation.required");
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setEditErrors({});
    const ok = await onUpdateMember(editingMember.id, {
      name: editingMember.name,
      email: editingMember.email,
      role: editingMember.role,
      password: editPassword || undefined,
    });

    if (ok) {
      setIsEditMemberDialogOpen(false);
      setEditingMember(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
          <div className="relative flex-1">
            <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("dashboard.team.list.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ltr:pl-10 rtl:pr-10"
            />
          </div>
          <Select
            value={selectedRole}
            onValueChange={(value: string) =>
              setSelectedRole(value as UserRole | "all")
            }
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t("dashboard.team.filters.role")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("dashboard.team.filters.allRoles")}
              </SelectItem>
              <SelectItem value="leader">{t("common.role.leader")}</SelectItem>
              <SelectItem value="client">{t("common.role.client")}</SelectItem>
              <SelectItem value="member">{t("common.role.member")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {currentUser.role === "leader" && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 whitespace-nowrap">
                <UserPlus className="h-4 w-4" />
                {t("dashboard.team.list.addButton")}
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl"
              onPointerDownOutside={(e: Event) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>
                  {t("dashboard.team.modals.create.title")}
                </DialogTitle>
                <DialogDescription>
                  {t("dashboard.team.modals.create.description")}
                </DialogDescription>
              </DialogHeader>
              <DialogBody>
                <div className="space-y-4 py-4">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      {t("dashboard.team.form.fields.name")}
                    </Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) =>
                        setNewMember({ ...newMember, name: e.target.value })
                      }
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t("dashboard.team.form.fields.email")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) =>
                        setNewMember({ ...newMember, email: e.target.value })
                      }
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      {t("dashboard.team.form.fields.password")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={newMember.password}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            password: e.target.value,
                          })
                        }
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
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {t("dashboard.team.form.fields.role")}
                    </Label>
                    <Select
                      value={newMember.role || undefined}
                      onValueChange={(value: UserRole) =>
                        setNewMember({ ...newMember, role: value })
                      }
                      dir={language === "ar" ? "rtl" : "ltr"}
                    >
                      <SelectTrigger
                        className={
                          !newMember.role ? "text-muted-foreground" : ""
                        }
                      >
                        <SelectValue
                          placeholder={t(
                            "dashboard.team.placeholders.selectRole",
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leader">
                          {t("common.role.leader")}
                        </SelectItem>
                        <SelectItem value="client">
                          {t("common.role.client")}
                        </SelectItem>
                        <SelectItem value="member">
                          {t("common.role.member")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-600 mt-1">{errors.role}</p>
                    )}
                  </div>
                </div>
              </DialogBody>
              <div className="flex gap-2 pt-4 shrink-0">
                <Button onClick={handleAddMember} className="flex-1">
                  <Plus className="h-4 w-4" />
                  {t("dashboard.team.form.actions.create")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  <Ban className="h-4 w-4" />
                  {t("common.button.cancel")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredUsers.map((u) => u.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-8">
            {(["leader", "client", "member"] as const).map((role) => {
              const group = groupedUsers[role];
              if (
                group.length === 0 &&
                selectedRole !== "all" &&
                selectedRole !== role
              )
                return null;

              return (
                <DroppableRoleGroup
                  key={role}
                  role={role}
                  title={`${t(`common.role.${role}`)} (${group.length})`}
                >
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {group.map((user) => (
                      <SortableMemberCard
                        key={user.id}
                        user={user}
                        currentUser={currentUser}
                        onEditClick={onEditClick}
                        onDeleteMember={onDeleteMember}
                        isDragDisabled={
                          currentUser.role !== "leader" || isMobile
                        }
                        isActive={activeId === user.id}
                        t={t}
                      />
                    ))}
                  </div>
                  {group.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("dashboard.team.list.noMembers")}
                    </div>
                  )}
                </DroppableRoleGroup>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-90 rotate-2 scale-105 cursor-grabbing shadow-2xl">
              {(() => {
                const user = localUsers.find((u) => u.id === activeId);
                return user ? (
                  <Card className="relative shadow-2xl ring-2 ring-primary !border-0">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${
                              user.role === "leader"
                                ? "from-emerald-500 to-emerald-600"
                                : user.role === "client"
                                  ? "from-blue-500 to-blue-600"
                                  : "from-slate-500 to-slate-600"
                            }`}
                          >
                            <UserIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {user.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-6">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold pointer-events-none border">
                          <Shield className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                          {t(`common.role.${user.role}`)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Dialog
        open={isEditMemberDialogOpen}
        onOpenChange={setIsEditMemberDialogOpen}
      >
        <DialogContent
          className="max-w-2xl"
          onPointerDownOutside={(e: Event) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{t("dashboard.team.modals.edit.title")}</DialogTitle>
            <DialogDescription>
              {t("dashboard.team.modals.edit.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            {editingMember && (
              <div className="space-y-4 py-4">
                <div className="space-y-1">
                  <Label
                    htmlFor="edit-name"
                    className="flex items-center gap-2"
                  >
                    <UserIcon className="h-4 w-4" />
                    {t("dashboard.team.form.labels.memberName")}
                  </Label>
                  <Input
                    id="edit-name"
                    value={editingMember.name}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        name: e.target.value,
                      })
                    }
                  />
                  {editErrors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {editErrors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="edit-email"
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {t("dashboard.team.form.labels.memberEmail")}
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingMember.email}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        email: e.target.value,
                      })
                    }
                  />
                  {editErrors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {editErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="edit-password"
                    className="flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    {t("dashboard.team.form.fields.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showEditPassword ? "text" : "password"}
                      placeholder={t("dashboard.team.placeholders.leaveBlank")}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="ltr:pr-10 rtl:pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showEditPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {editErrors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {editErrors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="edit-role"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    {t("dashboard.team.form.fields.role")}
                  </Label>
                  <Select
                    value={editingMember.role}
                    onValueChange={(value: UserRole) =>
                      setEditingMember({ ...editingMember, role: value })
                    }
                    dir={language === "ar" ? "rtl" : "ltr"}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUser.role === "leader" && (
                        <SelectItem value="leader">
                          {t("common.role.leader")}
                        </SelectItem>
                      )}
                      {currentUser.role === "leader" && (
                        <SelectItem value="client">
                          {t("common.role.client")}
                        </SelectItem>
                      )}
                      <SelectItem value="member">
                        {t("common.role.member")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {editErrors.role && (
                    <p className="text-sm text-red-600 mt-1">
                      {editErrors.role}
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogBody>
          <div className="flex gap-2 pt-4 shrink-0">
            <Button onClick={handleEditSubmit} className="flex-1">
              <Save className="h-4 w-4" />
              {t("common.button.save")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditMemberDialogOpen(false)}
            >
              <Ban className="h-4 w-4" />
              {t("common.button.cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
