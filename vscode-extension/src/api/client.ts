import type {
  LoginResponse,
  MeResponse,
  Project,
  Section,
  Task,
  TaskCreateInput,
  User,
} from "./types";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

export interface ApiClientDeps {
  getBaseUrl: () => string;
  getToken: () => string | undefined;
  clientHeader?: Record<string, string>;
}

const API_CLIENT_HEADER = "x-taskboard-client";
const API_CLIENT_VALUE = "vscode";

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(trimmed)) {
    return `http://${trimmed}`;
  }

  return trimmed;
}

export class ApiClient {
  constructor(private readonly deps: ApiClientDeps) {}

  private get baseUrl(): string {
    return normalizeBaseUrl(this.deps.getBaseUrl());
  }

  private buildUrl(path: string): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}/api${cleanPath}`;
  }

  private buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      [API_CLIENT_HEADER]: API_CLIENT_VALUE,
      ...(this.deps.clientHeader ?? {}),
      ...(extra ?? {}),
    };

    const token = this.deps.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    path: string,
    init: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
      timeoutMs?: number;
    } = {},
  ): Promise<T> {
    const { method = "GET", body, headers, timeoutMs = 15000 } = init;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(this.buildUrl(path), {
        method,
        headers: this.buildHeaders(headers),
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const message = await this.extractErrorMessage(response);
        throw new ApiClientError(message, response.status);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const text = await response.text();
      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text) as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiClientError("Request timed out. Is the server running?");
      }

      const reason = error instanceof Error ? error.message : String(error);
      throw new ApiClientError(`Failed to reach ${this.baseUrl}: ${reason}`);
    } finally {
      clearTimeout(timer);
    }
  }

  private async extractErrorMessage(response: Response): Promise<string> {
    try {
      const text = await response.text();
      if (text) {
        const parsed = JSON.parse(text) as { error?: string; message?: string };
        if (parsed.error) return parsed.error;
        if (parsed.message) return parsed.message;
      }
    } catch {}

    if (response.status === 401) return "Unauthorized. Please sign in again.";
    if (response.status === 403) return "You do not have permission.";
    if (response.status === 404) return "Resource not found.";
    if (response.status === 429) return "Too many requests. Please wait.";

    return `Request failed (${response.status})`;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
      headers: { "Content-Type": "application/json" },
    });
  }

  async me(): Promise<MeResponse> {
    return this.request<MeResponse>("/auth/me");
  }

  async logout(): Promise<void> {
    return this.request<void>("/auth/logout", { method: "POST" });
  }

  async getProjects(): Promise<Project[]> {
    const data = await this.request<{ projects: Project[] }>("/projects");
    return data.projects ?? [];
  }

  async getSections(projectId?: string): Promise<Section[]> {
    const query = projectId
      ? `?projectId=${encodeURIComponent(projectId)}`
      : "";
    const data = await this.request<{ sections: Section[] }>(
      `/sections${query}`,
    );
    return data.sections ?? [];
  }

  async getTasks(
    params: { projectId?: string; sectionId?: string } = {},
  ): Promise<Task[]> {
    const search = new URLSearchParams();
    if (params.projectId) search.set("projectId", params.projectId);
    if (params.sectionId) search.set("sectionId", params.sectionId);

    const query = search.size > 0 ? `?${search.toString()}` : "";
    const data = await this.request<{ tasks: Task[] }>(`/tasks${query}`);
    return data.tasks ?? [];
  }

  async getUsers(): Promise<User[]> {
    const data = await this.request<{ users: User[] }>("/users");
    return data.users ?? [];
  }

  async createTask(input: TaskCreateInput): Promise<Task> {
    const data = await this.request<{ task: Task }>("/tasks", {
      method: "POST",
      body: input,
      headers: { "Content-Type": "application/json" },
    });
    return data.task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const data = await this.request<{ task: Task }>(
      `/tasks/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: updates,
        headers: { "Content-Type": "application/json" },
      },
    );
    return data.task;
  }

  get projectUrl(): string {
    return `${this.baseUrl}/dashboard/projects`;
  }

  projectPageUrl(projectId: string): string {
    return `${this.baseUrl}/dashboard/projects/${encodeURIComponent(projectId)}`;
  }
}
