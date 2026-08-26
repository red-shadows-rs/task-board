export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type UserRole = "leader" | "client" | "member";
export type Priority = "low" | "medium" | "high" | "urgent";
export type ProjectStatus = "planning" | "active" | "completed" | "on_hold";
export type Language = "en" | "ar";

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  order?: number;
}

export interface Project {
  id: string;
  title: {
    en: string;
    ar: string;
  };

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
  title: {
    en: string;
    ar: string;
  };
  order?: number;
}

export interface Task {
  id: string;
  sectionId: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
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
  assigneePrices?: { userId: string; price: number }[];
}

export interface AppState {
  user: User | null;
  sections: Section[];
  users: User[];
  projects: Project[];
  tasks: Task[];
  filteredProjects: Project[];
  searchQuery: string;
  statusFilter: string;

  setUser: (user: User | null) => void;
  setSections: (sections: Section[]) => void;
  setUsers: (users: User[]) => void;
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  addSection: (section: Section) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  filterProjects: () => void;
}
