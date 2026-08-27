export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type UserRole = "leader" | "client" | "member";
export type Priority = "low" | "medium" | "high" | "urgent";
export type ProjectStatus = "planning" | "active" | "completed" | "on_hold";

export interface LocalizedText {
  en: string;
  ar: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  order?: number;
}

export interface Project {
  id: string;
  title: LocalizedText;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  teamMembers: string[];
  color?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  order?: number;
}

export interface Section {
  id: string;
  projectId: string;
  title: LocalizedText;
  order?: number;
}

export interface Task {
  id: string;
  sectionId: string;
  title: LocalizedText;
  description: LocalizedText;
  status: TaskStatus;
  assignedTo: string[];
  dueDate: string;
  priority: Priority;
  tags: string[];
  order?: number;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  sessionToken?: string;
}

export interface MeResponse {
  user: User;
}

export type TaskCreateInput = Pick<
  Task,
  "sectionId" | "title" | "description" | "status" | "priority"
> & {
  assignedTo?: string[];
  dueDate?: string;
  tags?: string[];
};
