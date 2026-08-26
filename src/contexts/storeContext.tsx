"use client";

import { create } from "zustand";

import type { AppState } from "@/types";

export const useStore = create<AppState>((set, get) => ({
  user: null,
  sections: [],
  users: [],
  projects: [],
  tasks: [],
  filteredProjects: [],
  searchQuery: "",
  statusFilter: "all",

  setUser: (user) => set({ user }),

  setSections: (sections) => set({ sections }),

  setUsers: (users) => set({ users }),

  setProjects: (projects) => {
    set({ projects });
    get().filterProjects();
  },

  setTasks: (tasks) => set({ tasks }),

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterProjects();
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().filterProjects();
  },

  addSection: (section) => {
    const currentSections = get().sections;
    const sections = Array.isArray(currentSections)
      ? [...currentSections, section]
      : [section];
    set({ sections });
  },

  updateSection: (id, updates) => {
    const currentSections = get().sections;
    if (!Array.isArray(currentSections)) {
      return;
    }
    const sections = currentSections.map((section) =>
      section.id === id ? { ...section, ...updates } : section,
    );
    set({ sections });
  },

  deleteSection: (id) => {
    const currentSections = get().sections;
    if (!Array.isArray(currentSections)) {
      return;
    }
    const sections = currentSections.filter((section) => section.id !== id);
    set({ sections });
  },

  addProject: (project) => {
    const currentProjects = get().projects;
    const projects = Array.isArray(currentProjects)
      ? [...currentProjects, project]
      : [project];
    set({ projects });
    get().filterProjects();
  },

  updateProject: (id, updates) => {
    const currentProjects = get().projects;
    if (!Array.isArray(currentProjects)) {
      return;
    }
    const projects = currentProjects.map((project) =>
      project.id === id ? { ...project, ...updates } : project,
    );
    set({ projects });
    get().filterProjects();
  },

  deleteProject: (id) => {
    const currentProjects = get().projects;
    if (!Array.isArray(currentProjects)) {
      return;
    }
    const projects = currentProjects.filter((project) => project.id !== id);
    set({ projects });
    get().filterProjects();
  },

  addTask: (task) => {
    const currentTasks = get().tasks;
    const tasks = Array.isArray(currentTasks)
      ? [...currentTasks, task]
      : [task];
    set({ tasks });
  },

  updateTask: (id, updates) => {
    const currentTasks = get().tasks;
    if (!Array.isArray(currentTasks)) {
      return;
    }
    const tasks = currentTasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task,
    );
    set({ tasks });
  },

  deleteTask: (id) => {
    const currentTasks = get().tasks;
    if (!Array.isArray(currentTasks)) {
      return;
    }
    const tasks = currentTasks.filter((task) => task.id !== id);
    set({ tasks });
  },

  filterProjects: () => {
    const { projects, searchQuery, statusFilter } = get();

    if (!Array.isArray(projects)) {
      set({ filteredProjects: [] });
      return;
    }

    let filtered = [...projects];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.title.en.toLowerCase().includes(query) ||
          project.title.ar.toLowerCase().includes(query),
      );
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    set({ filteredProjects: filtered });
  },
}));
