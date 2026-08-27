import * as vscode from "vscode";

import type {
  LocalizedText,
  Priority,
  Project,
  Section,
  Task,
  TaskStatus,
} from "../api/types";
import type { TaskBoardStore } from "./store";

export function localizedLabel(text: LocalizedText | undefined): string {
  if (!text) return "(untitled)";
  return text.en?.trim() || text.ar?.trim() || "(untitled)";
}

function localizedSecondary(
  text: LocalizedText | undefined,
): string | undefined {
  if (!text) return undefined;
  const primary = text.en?.trim();
  const secondary = text.ar?.trim();

  if (primary && secondary && secondary !== primary) {
    return secondary;
  }

  return undefined;
}

export abstract class TreeNode extends vscode.TreeItem {
  abstract readonly kind: "project" | "section" | "task";
}

export class ProjectNode extends TreeNode {
  readonly kind = "project" as const;

  constructor(public readonly project: Project) {
    super(
      localizedLabel(project.title),
      vscode.TreeItemCollapsibleState.Collapsed,
    );

    this.contextValue = "project";
    this.description = project.status.replace(/_/g, " ");
    this.iconPath = new vscode.ThemeIcon("project");
    this.tooltip = this.buildTooltip();
    this.id = `project:${project.id}`;
  }

  private buildTooltip(): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    const secondary = localizedSecondary(this.project.title);

    md.appendMarkdown(`**${localizedLabel(this.project.title)}**`);
    if (secondary) md.appendMarkdown(`\n\n${secondary}`);
    md.appendMarkdown(`\n\nStatus: ${this.project.status.replace(/_/g, " ")}`);

    if (this.project.startDate) {
      md.appendMarkdown(`\n\nStart: ${this.project.startDate}`);
    }
    if (this.project.endDate) {
      md.appendMarkdown(`\n\nEnd: ${this.project.endDate}`);
    }

    return md;
  }
}

export class SectionNode extends TreeNode {
  readonly kind = "section" as const;

  constructor(
    public readonly section: Section,
    doneCount: number,
    taskCount: number,
  ) {
    super(
      localizedLabel(section.title),
      vscode.TreeItemCollapsibleState.Collapsed,
    );

    this.contextValue = "section";
    this.description = taskCount > 0 ? `${doneCount}/${taskCount}` : "no tasks";
    this.iconPath = new vscode.ThemeIcon("list-tree");
    this.tooltip =
      localizedSecondary(section.title) ?? localizedLabel(section.title);
    this.id = `section:${section.id}`;
  }
}

export const STATUS_META: Record<
  TaskStatus,
  { label: string; icon: string; color?: string }
> = {
  todo: { label: "To Do", icon: "circle-large-outline" },
  in_progress: {
    label: "In Progress",
    icon: "sync~spin",
    color: "charts.blue",
  },
  in_review: { label: "In Review", icon: "eye", color: "charts.yellow" },
  done: { label: "Done", icon: "pass-filled", color: "charts.green" },
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Med",
  high: "High",
  urgent: "Urgent",
};

export class TaskNode extends TreeNode {
  readonly kind = "task" as const;

  constructor(
    public readonly task: Task,
    private readonly store: TaskBoardStore,
    options: { showSection?: boolean } = {},
  ) {
    super(localizedLabel(task.title), vscode.TreeItemCollapsibleState.None);

    this.contextValue = `task.${task.status}`;
    this.id = `task:${task.id}`;

    const statusIcon = STATUS_META[task.status] ?? STATUS_META.todo;
    this.iconPath = new vscode.ThemeIcon(
      statusIcon.icon,
      statusIcon.color ? new vscode.ThemeColor(statusIcon.color) : undefined,
    );

    this.description = this.buildDescription(options.showSection);
    this.tooltip = this.buildTooltip();
    this.resourceUri = vscode.Uri.parse(`taskboard://task/${task.id}`);
  }

  private buildDescription(showSection?: boolean): string {
    const parts: string[] = [];

    if (this.task.priority && this.task.priority !== "medium") {
      parts.push(PRIORITY_LABELS[this.task.priority]);
    }

    if (this.task.dueDate) {
      const overdue = this.isOverdue();
      parts.push(`${overdue ? "⚠ " : ""}${this.task.dueDate}`);
    }

    if (showSection) {
      const section = this.store.sections.find(
        (s) => s.id === this.task.sectionId,
      );
      if (section) parts.push(localizedLabel(section.title));
    }

    return parts.join(" · ");
  }

  private isOverdue(): boolean {
    if (!this.task.dueDate || this.task.status === "done") return false;
    const due = new Date(this.task.dueDate);
    return !Number.isNaN(due.getTime()) && due.getTime() < Date.now();
  }

  private buildTooltip(): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${localizedLabel(this.task.title)}**\n\n`);
    md.appendMarkdown(`Status: ${STATUS_META[this.task.status].label}\n\n`);
    md.appendMarkdown(`Priority: ${this.task.priority}\n\n`);

    const secondary = localizedSecondary(this.task.title);
    if (secondary) md.appendMarkdown(`${secondary}\n\n`);

    const description =
      this.task.description?.en?.trim() || this.task.description?.ar?.trim();
    if (description) md.appendMarkdown(`${description}\n\n`);

    if (this.task.assignedTo.length > 0) {
      const names = this.task.assignedTo
        .map((id) => this.store.userNameFor(id))
        .filter(Boolean)
        .join(", ");
      if (names) md.appendMarkdown(`Assigned: ${names}\n\n`);
    }

    if (this.task.tags.length > 0) {
      md.appendMarkdown(`Tags: ${this.task.tags.join(", ")}\n\n`);
    }

    if (this.task.dueDate) md.appendMarkdown(`Due: ${this.task.dueDate}`);

    return md;
  }
}

export class TaskBoardTreeProvider implements vscode.TreeDataProvider<TreeNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<
    TreeNode | undefined | null | void
  >();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  constructor(private readonly store: TaskBoardStore) {
    this.store.onDidChange(() => this.onDidChangeTreeDataEmitter.fire());
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeNode): Promise<TreeNode[]> {
    if (!this.store.loaded && !this.store.isLoading) {
      await this.store.refresh();
    }

    if (!element) {
      return this.store.projects.map((project) => new ProjectNode(project));
    }

    if (element instanceof ProjectNode) {
      return this.store.sections
        .filter((section) => section.projectId === element.project.id)
        .map((section) => {
          const sectionTasks = this.store.tasks.filter(
            (task) => task.sectionId === section.id,
          );
          const done = sectionTasks.filter(
            (task) => task.status === "done",
          ).length;
          return new SectionNode(section, done, sectionTasks.length);
        });
    }

    if (element instanceof SectionNode) {
      return this.store.tasks
        .filter((task) => task.sectionId === element.section.id)
        .map((task) => new TaskNode(task, this.store));
    }

    return [];
  }
}
