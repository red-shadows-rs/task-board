import * as vscode from "vscode";

import type { SessionStore } from "../auth/session";
import type { TaskBoardStore } from "./store";

export class AccountNode extends vscode.TreeItem {
  constructor(
    label: string,
    options: {
      description?: string;
      icon?: string;
      color?: string;
      command?: vscode.Command;
      contextValue?: string;
      tooltip?: string;
    } = {},
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.description = options.description;
    if (options.icon) {
      this.iconPath = new vscode.ThemeIcon(
        options.icon,
        options.color ? new vscode.ThemeColor(options.color) : undefined,
      );
    }
    this.command = options.command;
    this.contextValue = options.contextValue ?? "account.info";
    this.tooltip = options.tooltip;
  }
}

export class AccountTreeProvider implements vscode.TreeDataProvider<AccountNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<
    AccountNode | undefined | null | void
  >();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  constructor(
    private readonly session: SessionStore,
    private readonly store: TaskBoardStore,
  ) {
    this.store.onDidChange(() => this.onDidChangeTreeDataEmitter.fire());
    this.session.onDidChangeSession(() =>
      this.onDidChangeTreeDataEmitter.fire(),
    );
  }

  getTreeItem(element: AccountNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AccountNode): AccountNode[] {
    if (element || !this.session.signedIn) {
      return [];
    }

    const user = this.session.getUser();
    const openTasks = this.store.myOpenTasks.length;
    const doneTasks = this.store.tasks.filter(
      (task) =>
        task.status === "done" &&
        user !== undefined &&
        task.assignedTo.includes(user.id),
    ).length;

    const nodes: AccountNode[] = [
      new AccountNode(user?.name ?? "Unknown user", {
        icon: "account",
        color: "charts.purple",
        description: user?.role ?? "",
        tooltip: user?.email,
      }),
      new AccountNode(this.session.baseUrl, {
        icon: "globe",
        contextValue: "account.server",
        command: {
          command: "taskboard.openDashboard",
          title: "Open Dashboard",
        },
        tooltip: "Open the TaskBoard dashboard in your browser",
      }),
      new AccountNode("Open Dashboard", {
        icon: "link-external",
        contextValue: "account.action",
        command: {
          command: "taskboard.openDashboard",
          title: "Open Dashboard",
        },
      }),
      new AccountNode("Sign Out", {
        icon: "sign-out",
        contextValue: "account.action",
        command: {
          command: "taskboard.signOut",
          title: "Sign Out",
        },
      }),
    ];

    if (this.store.loaded) {
      nodes.splice(
        2,
        0,
        new AccountNode("My open tasks", {
          description: `${openTasks}`,
          icon: "inbox",
          color: openTasks > 0 ? "charts.blue" : undefined,
          command: {
            command: "taskboard.focusMyTasks",
            title: "Show My Tasks",
          },
        }),
        new AccountNode("My completed tasks", {
          description: `${doneTasks}`,
          icon: "pass-filled",
          color: "charts.green",
          command: {
            command: "taskboard.focusMyTasks",
            title: "Show My Tasks",
          },
        }),
      );
    }

    return nodes;
  }
}
