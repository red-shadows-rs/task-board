import * as vscode from "vscode";

import { ApiClientError } from "../api/client";

import type { Priority, TaskStatus } from "../api/types";
import type { SessionStore } from "../auth/session";
import { SectionNode, TaskNode, localizedLabel } from "./treeProvider";
import type { TaskBoardStore } from "./store";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export async function setTaskStatus(
  session: SessionStore,
  store: TaskBoardStore,
  node?: TaskNode,
): Promise<void> {
  if (!node) {
    vscode.window.showWarningMessage("Select a task to update.");
    return;
  }

  if (!requireSignedIn(session)) {
    return;
  }

  const user = session.getUser();
  const isMember = user?.role === "member";
  const isAssignee = user ? node.task.assignedTo.includes(user.id) : false;

  if (isMember && !isAssignee) {
    vscode.window.showWarningMessage(
      "Members can only update tasks assigned to them.",
    );
    return;
  }

  const options = STATUS_OPTIONS.filter(
    (option) => !(isMember && option.value === "done"),
  );

  const picked = await vscode.window.showQuickPick(
    options.map((option) => ({
      label: option.label,
      description: option.value === node.task.status ? "current" : undefined,
      value: option.value,
    })),
    {
      title: `Set status for "${localizedLabel(node.task.title)}"`,
      placeHolder: "Choose a status",
    },
  );

  if (!picked || picked.value === node.task.status) {
    return;
  }

  try {
    await session.clientApi.updateTask(node.task.id, { status: picked.value });
    await store.refresh();
    vscode.window.setStatusBarMessage(
      `Task updated to "${picked.label}"`,
      3000,
    );
  } catch (error) {
    showApiError(error, "update the task");
  }
}

export async function createTask(
  session: SessionStore,
  store: TaskBoardStore,
  node?: SectionNode,
): Promise<void> {
  if (!node) {
    vscode.window.showWarningMessage("Select a section to add a task to.");
    return;
  }

  if (!requireSignedIn(session)) {
    return;
  }

  if (!session.canCreateTask) {
    vscode.window.showWarningMessage(
      "Your role does not allow creating tasks.",
    );
    return;
  }

  const title = await vscode.window.showInputBox({
    title: `New Task in "${localizedLabel(node.section.title)}"`,
    prompt: "Task title",
    ignoreFocusOut: true,
    validateInput: (value) =>
      value.trim().length >= 1 ? undefined : "Title is required",
  });

  if (!title) {
    return;
  }

  const description = await vscode.window.showInputBox({
    title: "New Task",
    prompt: "Task description (optional)",
    value: "",
    ignoreFocusOut: true,
  });

  if (description === undefined) {
    return;
  }

  const statusPicked = await vscode.window.showQuickPick(
    STATUS_OPTIONS.filter((option) => option.value !== "done").map(
      (option) => ({ label: option.label, value: option.value }),
    ),
    { title: "New Task", placeHolder: "Initial status" },
  );

  if (!statusPicked) {
    return;
  }

  const priorityPicked = await vscode.window.showQuickPick(
    PRIORITY_OPTIONS.map((option) => ({
      label: option.label,
      value: option.value,
    })),
    { title: "New Task", placeHolder: "Priority" },
  );

  if (!priorityPicked) {
    return;
  }

  const titleText = title.trim();
  const descriptionText = description.trim() || titleText;

  try {
    await session.clientApi.createTask({
      sectionId: node.section.id,
      title: { en: titleText, ar: titleText },
      description: { en: descriptionText, ar: descriptionText },
      status: statusPicked.value,
      priority: priorityPicked.value,
    });

    await store.refresh();
    vscode.window.setStatusBarMessage(`Task "${titleText}" created`, 3000);
  } catch (error) {
    showApiError(error, "create the task");
  }
}

function requireSignedIn(session: SessionStore): boolean {
  if (!session.signedIn) {
    vscode.window
      .showWarningMessage("You are not signed in to TaskBoard.", "Sign In")
      .then((choice) => {
        if (choice === "Sign In") {
          void vscode.commands.executeCommand("taskboard.signIn");
        }
      });
    return false;
  }

  return true;
}

function showApiError(error: unknown, action: string): void {
  const message =
    error instanceof ApiClientError ? error.message : `Failed to ${action}.`;
  vscode.window.showErrorMessage(`TaskBoard: ${message}`);
}
