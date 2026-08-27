import * as vscode from "vscode";

import type { Task, TaskStatus } from "../api/types";
import { STATUS_META, TaskNode } from "./treeProvider";
import type { TaskBoardStore } from "./store";

export type MyTasksElement = StatusGroupNode | TaskNode;

export class StatusGroupNode extends vscode.TreeItem {
  constructor(
    public readonly status: TaskStatus,
    count: number,
  ) {
    super(STATUS_META[status].label, vscode.TreeItemCollapsibleState.Expanded);

    const meta = STATUS_META[status];
    this.id = `mytasks:${status}`;
    this.contextValue = "statusGroup";
    this.description = `${count}`;
    this.iconPath = new vscode.ThemeIcon(
      meta.icon.replace(/~spin$/, ""),
      meta.color ? new vscode.ThemeColor(meta.color) : undefined,
    );
  }
}

export class MyTasksTreeProvider implements vscode.TreeDataProvider<MyTasksElement> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<
    MyTasksElement | undefined | null | void
  >();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  private static readonly ORDER: TaskStatus[] = [
    "in_progress",
    "in_review",
    "todo",
    "done",
  ];

  constructor(private readonly store: TaskBoardStore) {
    this.store.onDidChange(() => this.onDidChangeTreeDataEmitter.fire());
  }

  getTreeItem(element: MyTasksElement): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: MyTasksElement): Promise<MyTasksElement[]> {
    const user = this.store.myUser;
    if (!user) return [];

    if (!this.store.loaded && !this.store.isLoading) {
      await this.store.refresh();
    }

    const mine = this.store.tasks.filter((task) =>
      task.assignedTo.includes(user.id),
    );

    if (!element) {
      return MyTasksTreeProvider.ORDER.map((status) => {
        const count = mine.filter((task) => task.status === status).length;
        return new StatusGroupNode(status, count);
      }).filter(
        (group) =>
          group.status !== "done" ||
          mine.some((task) => task.status === "done"),
      );
    }

    if (element instanceof StatusGroupNode) {
      return mine
        .filter((task) => task.status === element.status)
        .map((task) => this.toNode(task));
    }

    return [];
  }

  private toNode(task: Task): TaskNode {
    const node = new TaskNode(task, this.store, { showSection: true });
    node.id = `mytask:${task.id}`;
    return node;
  }
}
