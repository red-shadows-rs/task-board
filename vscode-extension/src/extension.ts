import * as vscode from "vscode";

import { SessionStore } from "./auth/session";
import { StatusBar } from "./statusBar";
import { AccountTreeProvider } from "./views/accountProvider";
import { MyTasksTreeProvider } from "./views/myTasksProvider";
import { TaskBoardStore } from "./views/store";
import { createTask, setTaskStatus } from "./views/taskActions";
import {
  ProjectNode,
  TaskBoardTreeProvider,
  TaskNode,
} from "./views/treeProvider";

let refreshTimer: NodeJS.Timeout | undefined;

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const session = new SessionStore(context);
  const store = new TaskBoardStore(session);
  const projects = new TaskBoardTreeProvider(store);
  const myTasks = new MyTasksTreeProvider(store);
  const account = new AccountTreeProvider(session, store);
  const statusBar = new StatusBar(context, store);

  context.subscriptions.push(
    vscode.window.createTreeView("taskboard.explorer", {
      treeDataProvider: projects,
      showCollapseAll: true,
    }),
    vscode.window.createTreeView("taskboard.myTasks", {
      treeDataProvider: myTasks,
      showCollapseAll: true,
    }),
    vscode.window.createTreeView("taskboard.account", {
      treeDataProvider: account,
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("taskboard.signIn", async () => {
      const ok = await session.signIn();
      if (ok) {
        await store.refresh();
        statusBar.update();
      }
    }),

    vscode.commands.registerCommand("taskboard.signOut", async () => {
      await session.signOut();
      statusBar.hide();
      await store.refresh();
    }),

    vscode.commands.registerCommand("taskboard.refresh", async () => {
      await store.refresh();
      statusBar.update();
    }),

    vscode.commands.registerCommand("taskboard.focusExplorer", async () => {
      await vscode.commands.executeCommand("taskboard.explorer.focus");
    }),

    vscode.commands.registerCommand("taskboard.focusMyTasks", async () => {
      await vscode.commands.executeCommand("taskboard.myTasks.focus");
    }),

    vscode.commands.registerCommand("taskboard.openDashboard", async () => {
      await vscode.env.openExternal(
        vscode.Uri.parse(`${session.baseUrl}/dashboard`),
      );
    }),

    vscode.commands.registerCommand(
      "taskboard.setTaskStatus",
      (node?: TaskNode) => setTaskStatus(session, store, node),
    ),

    vscode.commands.registerCommand(
      "taskboard.createTask",
      (node?: Parameters<typeof createTask>[2]) =>
        createTask(session, store, node),
    ),

    vscode.commands.registerCommand(
      "taskboard.openInBrowser",
      (node?: ProjectNode | TaskNode) => openInBrowser(session, store, node),
    ),
  );

  context.subscriptions.push(
    session.onDidChangeSession(async () => {
      await store.refresh();
      statusBar.update();
    }),

    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("taskboard.baseUrl")) {
        void store.refresh().then(() => statusBar.update());
      }
      if (event.affectsConfiguration("taskboard.refreshIntervalSeconds")) {
        configureAutoRefresh(context, store, statusBar);
      }
    }),
  );

  await session.restore();

  if (session.signedIn) {
    await store.refresh();
    statusBar.update();
  }

  configureAutoRefresh(context, store, statusBar);
}

async function openInBrowser(
  session: SessionStore,
  store: TaskBoardStore,
  node?: ProjectNode | TaskNode,
): Promise<void> {
  const client = session.clientApi;
  let url: string;

  if (node instanceof ProjectNode) {
    url = client.projectPageUrl(node.project.id);
  } else if (node instanceof TaskNode) {
    const projectId = store.getProjectIdForTask(node.task.id);
    url = projectId ? client.projectPageUrl(projectId) : client.projectUrl;
  } else {
    url = client.projectUrl;
  }

  await vscode.env.openExternal(vscode.Uri.parse(url));
}

function configureAutoRefresh(
  context: vscode.ExtensionContext,
  store: TaskBoardStore,
  statusBar: StatusBar,
): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = undefined;
  }

  const seconds = vscode.workspace
    .getConfiguration("taskboard")
    .get<number>("refreshIntervalSeconds", 0);

  if (!seconds || seconds <= 0) {
    return;
  }

  refreshTimer = setInterval(() => {
    void store.refresh().then(() => statusBar.update());
  }, seconds * 1000);

  context.subscriptions.push(
    new vscode.Disposable(() => {
      if (refreshTimer) clearInterval(refreshTimer);
    }),
  );
}

export function deactivate(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = undefined;
  }
}
