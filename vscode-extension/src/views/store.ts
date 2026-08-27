import * as vscode from "vscode";

import { ApiClientError } from "../api/client";

import type { Project, Section, Task, User } from "../api/types";
import type { SessionStore } from "../auth/session";

export class TaskBoardStore {
  private readonly onDidChangeEmitter = new vscode.EventEmitter<void>();

  readonly onDidChange = this.onDidChangeEmitter.event;

  projects: Project[] = [];
  sections: Section[] = [];
  tasks: Task[] = [];
  users = new Map<string, User>();
  loaded = false;

  private loading = false;

  constructor(private readonly session: SessionStore) {}

  get myUser(): User | undefined {
    return this.session.getUser();
  }

  get myOpenTaskCount(): number {
    return this.myOpenTasks.length;
  }

  get myOpenTasks(): Task[] {
    const user = this.myUser;
    if (!user) return [];
    return this.tasks.filter(
      (task) => task.status !== "done" && task.assignedTo.includes(user.id),
    );
  }

  getProjectIdForTask(taskId: string): string | undefined {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return undefined;
    return this.sections.find((s) => s.id === task.sectionId)?.projectId;
  }

  userNameFor(userId: string): string | undefined {
    return this.users.get(userId)?.name;
  }

  async refresh(): Promise<void> {
    if (this.loading) return;

    if (!this.session.signedIn) {
      this.projects = [];
      this.sections = [];
      this.tasks = [];
      this.users.clear();
      this.loaded = false;
      this.fire();
      return;
    }

    this.loading = true;

    try {
      const client = this.session.clientApi;

      const [projects, sections, tasks, users] = await Promise.all([
        client.getProjects(),
        client.getSections(),
        client.getTasks(),
        client.getUsers(),
      ]);

      this.projects = projects.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      this.sections = sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      this.tasks = tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      this.users = new Map(users.map((user) => [user.id, user]));
      this.loaded = true;
    } catch (error) {
      this.loaded = false;

      if (error instanceof ApiClientError && error.isUnauthorized) {
        vscode.window
          .showWarningMessage(
            "TaskBoard session expired. Please sign in again.",
            "Sign In",
          )
          .then((choice) => {
            if (choice === "Sign In") {
              void vscode.commands.executeCommand("taskboard.signIn");
            }
          });
      } else if (error instanceof ApiClientError) {
        vscode.window.showErrorMessage(`TaskBoard: ${error.message}`);
      }
    } finally {
      this.loading = false;
      this.fire();
    }
  }

  get isLoading(): boolean {
    return this.loading;
  }

  private fire(): void {
    this.onDidChangeEmitter.fire();
  }
}
