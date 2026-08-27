import * as vscode from "vscode";

import type { TaskBoardStore } from "./views/store";

export class StatusBar {
  private readonly item: vscode.StatusBarItem;

  constructor(
    context: vscode.ExtensionContext,
    private readonly store: TaskBoardStore,
  ) {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.item.command = "taskboard.focusMyTasks";
    context.subscriptions.push(this.item);

    this.store.onDidChange(() => this.update());
  }

  update(): void {
    const count = this.store.myOpenTaskCount;

    if (count > 0) {
      this.item.text = `$(checklist) ${count}`;
      this.item.tooltip = `TaskBoard: ${count} open task${count === 1 ? "" : "s"} assigned to you`;
      this.item.show();
    } else {
      this.item.hide();
    }
  }

  hide(): void {
    this.item.hide();
  }
}
