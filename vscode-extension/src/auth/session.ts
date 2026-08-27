import * as vscode from "vscode";

import { ApiClient, ApiClientError } from "../api/client";

import type { User } from "../api/types";

const TOKEN_SECRET_KEY = "taskboard.sessionToken";
const USER_STATE_KEY = "taskboard.user";
const BASE_URL_CONFIG_KEY = "taskboard.baseUrl";

export class SessionStore {
  private readonly client: ApiClient;
  private readonly onDidChangeSessionEmitter = new vscode.EventEmitter<void>();

  readonly onDidChangeSession = this.onDidChangeSessionEmitter.event;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.client = new ApiClient({
      getBaseUrl: () => this.baseUrl,
      getToken: () => this.cachedToken,
    });
  }

  private cachedToken: string | undefined;

  get baseUrl(): string {
    return (
      vscode.workspace.getConfiguration("taskboard").get<string>("baseUrl") ??
      "http://localhost:3000"
    );
  }

  get clientApi(): ApiClient {
    return this.client;
  }

  getUser(): User | undefined {
    return this.context.globalState.get<User>(USER_STATE_KEY);
  }

  get signedIn(): boolean {
    return Boolean(this.getUser() && this.cachedToken);
  }

  get canCreateTask(): boolean {
    const role = this.getUser()?.role;
    return role === "leader" || role === "client";
  }

  async restore(): Promise<void> {
    const token = await this.context.secrets.get(TOKEN_SECRET_KEY);

    if (!token) {
      await this.updateContext();
      return;
    }

    this.cachedToken = token;

    try {
      const { user } = await this.client.me();
      await this.context.globalState.update(USER_STATE_KEY, user);
    } catch (error) {
      if (error instanceof ApiClientError && error.isUnauthorized) {
        await this.clear();
      }
    }

    await this.updateContext();
  }

  async signIn(): Promise<boolean> {
    const baseUrl = await this.ensureBaseUrl();
    if (!baseUrl) {
      return false;
    }

    if (
      !/^https:\/\//i.test(baseUrl) &&
      !/localhost|127\.0\.0\.1/.test(baseUrl)
    ) {
      vscode.window.showWarningMessage(
        "TaskBoard server URL is not HTTPS. Credentials and tokens will be sent in cleartext.",
      );
    }

    const email = await vscode.window.showInputBox({
      title: "TaskBoard: Sign In",
      prompt: "Email address",
      ignoreFocusOut: true,
      validateInput: (value) =>
        /^\S+@\S+\.\S+$/.test(value.trim()) ? undefined : "Enter a valid email",
    });

    if (!email) {
      return false;
    }

    const password = await vscode.window.showInputBox({
      title: "TaskBoard: Sign In",
      prompt: `Password for ${email.trim()}`,
      password: true,
      ignoreFocusOut: true,
    });

    if (!password) {
      return false;
    }

    try {
      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Signing in to TaskBoard...",
        },
        () => this.client.login(email.trim(), password),
      );

      if (!result.sessionToken) {
        vscode.window.showErrorMessage(
          "TaskBoard server did not return a session token. Please update the TaskBoard server.",
        );
        return false;
      }

      this.cachedToken = result.sessionToken;
      await this.context.secrets.store(TOKEN_SECRET_KEY, result.sessionToken);
      await this.context.globalState.update(USER_STATE_KEY, result.user);
      await this.updateContext();
      this.onDidChangeSessionEmitter.fire();

      vscode.window.showInformationMessage(
        `Signed in to TaskBoard as ${result.user.name}.`,
      );
      return true;
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to sign in to TaskBoard.";
      vscode.window.showErrorMessage(`TaskBoard: ${message}`);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      if (this.cachedToken) {
        await this.client.logout();
      }
    } catch {}

    await this.clear();
    this.onDidChangeSessionEmitter.fire();
    vscode.window.showInformationMessage("Signed out of TaskBoard.");
  }

  private async ensureBaseUrl(): Promise<string | undefined> {
    const configured = this.baseUrl;

    if (configured && configured !== "http://localhost:3000") {
      return configured;
    }

    const input = await vscode.window.showInputBox({
      title: "TaskBoard: Server URL",
      prompt: "Base URL of your TaskBoard instance",
      value: configured,
      ignoreFocusOut: true,
      validateInput: (value) =>
        value.trim().length > 0 ? undefined : "URL is required",
    });

    if (!input) {
      return undefined;
    }

    const normalized = input.trim().replace(/\/+$/, "");
    await vscode.workspace
      .getConfiguration("taskboard")
      .update("baseUrl", normalized, vscode.ConfigurationTarget.Global);

    return normalized;
  }

  private async clear(): Promise<void> {
    this.cachedToken = undefined;
    await this.context.secrets.delete(TOKEN_SECRET_KEY);
    await this.context.globalState.update(USER_STATE_KEY, undefined);
  }

  private async updateContext(): Promise<void> {
    const signedIn = this.signedIn;

    await vscode.commands.executeCommand(
      "setContext",
      "taskboard.signedIn",
      signedIn,
    );
    await vscode.commands.executeCommand(
      "setContext",
      "taskboard.canCreateTask",
      signedIn && this.canCreateTask,
    );
    await vscode.commands.executeCommand(
      "setContext",
      "taskboard.userRole",
      this.getUser()?.role ?? "",
    );
  }
}

export { BASE_URL_CONFIG_KEY };
