import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import type {
  Priority,
  Project,
  ProjectStatus,
  Section,
  Task,
  TaskStatus,
  User,
  UserRole,
} from "@/types";

export type AuthUser = User & {
  passwordHash: string;
  passwordChangedAt: number;
};

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "taskboard.db");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('leader', 'member', 'client')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  password_changed_at INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  color TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_members (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT NOT NULL DEFAULT '',
  description_ar TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  due_date TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tags TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS task_assignees (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (task_id, user_id)
);

CREATE TABLE IF NOT EXISTS task_attachments (
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (task_id, path)
);

CREATE INDEX IF NOT EXISTS idx_sections_project ON sections(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_section ON tasks(section_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_user ON task_assignees(user_id);
`;

interface DbHandle {
  db: Database.Database;
}

const globalStore = globalThis as typeof globalThis & {
  __taskboardDb?: DbHandle;
};

function initDb(): Database.Database {
  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_FILE);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}

export function getDb(): Database.Database {
  if (!globalStore.__taskboardDb) {
    globalStore.__taskboardDb = { db: initDb() };
  }
  return globalStore.__taskboardDb.db;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  sort_order: number;
  password_changed_at: number;
}

interface ProjectRow {
  id: string;
  title_en: string;
  title_ar: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  color: string;
  created_by: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SectionRow {
  id: string;
  project_id: string;
  title_en: string;
  title_ar: string;
  sort_order: number;
}

interface TaskRow {
  id: string;
  section_id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  status: TaskStatus;
  due_date: string;
  priority: Priority;
  tags: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface AssigneeRow {
  user_id: string;
  price: number | null;
}

interface AttachmentRow {
  path: string;
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    order: row.sort_order,
  };
}

function mapProject(row: ProjectRow, teamMembers: string[]): Project {
  return {
    id: row.id,
    title: { en: row.title_en, ar: row.title_ar },
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    teamMembers,
    color: row.color,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    order: row.sort_order,
  };
}

function mapSection(row: SectionRow): Section {
  return {
    id: row.id,
    projectId: row.project_id,
    title: { en: row.title_en, ar: row.title_ar },
    order: row.sort_order,
  };
}

function mapTask(
  row: TaskRow,
  assignees: AssigneeRow[],
  attachments: AttachmentRow[],
): Task {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(row.tags);
    if (Array.isArray(parsed))
      tags = parsed.filter((t) => typeof t === "string");
  } catch {
    tags = [];
  }

  const assignedTo = assignees.map((a) => a.user_id);
  const assigneePrices = assignees
    .filter((a) => a.price !== null && a.price !== undefined)
    .map((a) => ({ userId: a.user_id, price: a.price as number }));

  return {
    id: row.id,
    sectionId: row.section_id,
    title: { en: row.title_en, ar: row.title_ar },
    description: { en: row.description_en, ar: row.description_ar },
    status: row.status,
    assignedTo,
    dueDate: row.due_date,
    priority: row.priority,
    tags,
    order: row.sort_order,
    attachments: attachments.map((a) => a.path),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at || undefined,
    assigneePrices,
  };
}

export class UniqueConstraintError extends Error {
  constructor() {
    super("A record with this email already exists");
    this.name = "UniqueConstraintError";
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

export function countUsers(): number {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as {
    n: number;
  };
  return row.n;
}

export function countLeaders(): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'leader'")
    .get() as { n: number };
  return row.n;
}

export function listUsers(): User[] {
  const rows = getDb()
    .prepare("SELECT * FROM users ORDER BY sort_order ASC")
    .all() as UserRow[];
  return rows.map(mapUser);
}

export function listRelatedUsers(userId: string): User[] {
  const rows = getDb()
    .prepare(
      `SELECT u.* FROM users u
       WHERE u.id IN (
         SELECT pm2.user_id FROM project_members pm1
         JOIN project_members pm2 ON pm2.project_id = pm1.project_id
         WHERE pm1.user_id = ?
       )
       OR u.id IN (
         SELECT ta.user_id FROM task_assignees ta
         JOIN task_assignees ta2 ON ta2.task_id = ta.task_id
         WHERE ta2.user_id = ?
       )
       ORDER BY u.sort_order ASC`,
    )
    .all(userId, userId) as UserRow[];
  return rows.map(mapUser);
}

export function getUserById(id: string): User | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    UserRow | undefined;
  return row ? mapUser(row) : null;
}

export function getAuthUserById(id: string): AuthUser | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    UserRow | undefined;
  if (!row) return null;
  return {
    ...mapUser(row),
    passwordHash: row.password_hash,
    passwordChangedAt: row.password_changed_at,
  };
}

export function getAuthUserByEmail(email: string): AuthUser | null {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as UserRow | undefined;
  if (!row) return null;
  return {
    ...mapUser(row),
    passwordHash: row.password_hash,
    passwordChangedAt: row.password_changed_at,
  };
}

export function createUser(input: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}): User {
  const db = getDb();
  const now = new Date().toISOString();
  const maxOrder = (
    db
      .prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM users")
      .get() as {
      m: number;
    }
  ).m;

  try {
    db.prepare(
      `INSERT INTO users (id, name, email, password_hash, role, sort_order, password_changed_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    ).run(
      input.id,
      input.name,
      input.email,
      input.passwordHash,
      input.role,
      maxOrder + 1,
      now,
      now,
    );
  } catch (error) {
    if (isUniqueViolation(error)) throw new UniqueConstraintError();
    throw error;
  }

  return getUserById(input.id) as User;
}

export type UserFieldUpdates = {
  name?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  order?: number;
  passwordChanged?: boolean;
};

export function updateUserFields(
  id: string,
  updates: UserFieldUpdates,
): User | null {
  const db = getDb();
  const sets: string[] = [];
  const values: unknown[] = [];

  if (updates.name !== undefined) {
    sets.push("name = ?");
    values.push(updates.name);
  }
  if (updates.email !== undefined) {
    sets.push("email = ?");
    values.push(updates.email);
  }
  if (updates.passwordHash !== undefined) {
    sets.push("password_hash = ?");
    values.push(updates.passwordHash);
  }
  if (updates.role !== undefined) {
    sets.push("role = ?");
    values.push(updates.role);
  }
  if (updates.order !== undefined) {
    sets.push("sort_order = ?");
    values.push(updates.order);
  }
  if (updates.passwordChanged) {
    sets.push("password_changed_at = ?");
    values.push(Date.now());
  }

  if (sets.length === 0) return getUserById(id);

  sets.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  try {
    db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(
      ...values,
    );
  } catch (error) {
    if (isUniqueViolation(error)) throw new UniqueConstraintError();
    throw error;
  }

  return getUserById(id);
}

export function deleteUser(id: string): boolean {
  const result = getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
  return result.changes > 0;
}

export function reorderUsers(updates: { id: string; order: number }[]): void {
  const db = getDb();
  const stmt = db.prepare("UPDATE users SET sort_order = ? WHERE id = ?");
  const apply = db.transaction((items: { id: string; order: number }[]) => {
    for (const item of items) {
      stmt.run(item.order, item.id);
    }
  });
  apply(updates);
}

function getProjectMemberIds(
  db: Database.Database,
  projectId: string,
): string[] {
  const rows = db
    .prepare(
      "SELECT user_id FROM project_members WHERE project_id = ? ORDER BY user_id ASC",
    )
    .all(projectId) as { user_id: string }[];
  return rows.map((r) => r.user_id);
}

export function listProjects(forUser?: {
  id: string;
  role: UserRole;
}): Project[] {
  const db = getDb();
  let rows: ProjectRow[];

  if (forUser && forUser.role !== "leader") {
    rows = db
      .prepare(
        `SELECT p.* FROM projects p
         WHERE EXISTS (
           SELECT 1 FROM project_members pm
           WHERE pm.project_id = p.id AND pm.user_id = ?
         )
         ORDER BY p.sort_order ASC`,
      )
      .all(forUser.id) as ProjectRow[];
  } else {
    rows = db
      .prepare("SELECT * FROM projects ORDER BY sort_order ASC")
      .all() as ProjectRow[];
  }

  return rows.map((row) => mapProject(row, getProjectMemberIds(db, row.id)));
}

export function getProjectById(id: string): Project | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as
    ProjectRow | undefined;
  if (!row) return null;
  return mapProject(row, getProjectMemberIds(db, row.id));
}

function setProjectMembers(
  db: Database.Database,
  projectId: string,
  userIds: string[],
): void {
  db.prepare("DELETE FROM project_members WHERE project_id = ?").run(projectId);
  const insert = db.prepare(
    "INSERT OR IGNORE INTO project_members (project_id, user_id) VALUES (?, ?)",
  );
  for (const userId of [...new Set(userIds)]) {
    insert.run(projectId, userId);
  }
}

export function createProject(input: {
  id: string;
  title: { en: string; ar: string };
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  teamMembers: string[];
  color: string;
  createdBy: string;
  order: number;
}): Project {
  const db = getDb();
  const now = new Date().toISOString();
  const apply = db.transaction(() => {
    db.prepare(
      `INSERT INTO projects (id, title_en, title_ar, start_date, end_date, status, color, created_by, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      input.id,
      input.title.en,
      input.title.ar,
      input.startDate,
      input.endDate,
      input.status,
      input.color,
      input.createdBy,
      input.order,
      now,
      now,
    );
    setProjectMembers(db, input.id, input.teamMembers);
  });
  apply();
  return getProjectById(input.id) as Project;
}

export type ProjectFieldUpdates = {
  title?: { en: string; ar: string };
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  color?: string;
  order?: number;
  teamMembers?: string[];
};

export function updateProjectFields(
  id: string,
  updates: ProjectFieldUpdates,
): Project | null {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM projects WHERE id = ?").get(id);
  if (!existing) return null;

  const sets: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) {
    sets.push("title_en = ?", "title_ar = ?");
    values.push(updates.title.en, updates.title.ar);
  }
  if (updates.startDate !== undefined) {
    sets.push("start_date = ?");
    values.push(updates.startDate);
  }
  if (updates.endDate !== undefined) {
    sets.push("end_date = ?");
    values.push(updates.endDate);
  }
  if (updates.status !== undefined) {
    sets.push("status = ?");
    values.push(updates.status);
  }
  if (updates.color !== undefined) {
    sets.push("color = ?");
    values.push(updates.color);
  }
  if (updates.order !== undefined) {
    sets.push("sort_order = ?");
    values.push(updates.order);
  }

  sets.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  const apply = db.transaction(() => {
    db.prepare(`UPDATE projects SET ${sets.join(", ")} WHERE id = ?`).run(
      ...values,
    );
    if (updates.teamMembers !== undefined) {
      setProjectMembers(db, id, updates.teamMembers);
    }
  });
  apply();

  return getProjectById(id);
}

export function isProjectMember(projectId: string, userId: string): boolean {
  const row = getDb()
    .prepare(
      "SELECT 1 AS x FROM project_members WHERE project_id = ? AND user_id = ?",
    )
    .get(projectId, userId);
  return Boolean(row);
}

export function getMaxTaskOrderInSection(sectionId: string): number {
  const row = getDb()
    .prepare(
      "SELECT COALESCE(MAX(sort_order), -1) AS m FROM tasks WHERE section_id = ?",
    )
    .get(sectionId) as { m: number };
  return row.m;
}

export function getMaxSectionOrderInProject(projectId: string): number {
  const row = getDb()
    .prepare(
      "SELECT COALESCE(MAX(sort_order), -1) AS m FROM sections WHERE project_id = ?",
    )
    .get(projectId) as { m: number };
  return row.m;
}

export function getTaskProjectId(taskId: string): string | null {
  const row = getDb()
    .prepare(
      `SELECT s.project_id AS projectId FROM tasks t
       JOIN sections s ON s.id = t.section_id
       WHERE t.id = ?`,
    )
    .get(taskId) as { projectId: string } | undefined;
  return row ? row.projectId : null;
}

export function getSectionProjectId(sectionId: string): string | null {
  const row = getDb()
    .prepare("SELECT project_id AS projectId FROM sections WHERE id = ?")
    .get(sectionId) as { projectId: string } | undefined;
  return row ? row.projectId : null;
}

function collectTaskAttachmentPaths(
  db: Database.Database,
  whereClause: string,
  params: unknown[],
): string[] {
  const rows = db
    .prepare(
      `SELECT ta.path FROM task_attachments ta
       JOIN tasks t ON t.id = ta.task_id
       WHERE ${whereClause}`,
    )
    .all(...params) as AttachmentRow[];
  return rows.map((r) => r.path);
}

export function deleteProject(id: string): {
  deleted: boolean;
  attachments: string[];
} {
  const db = getDb();
  const attachments = collectTaskAttachmentPaths(
    db,
    `t.section_id IN (SELECT id FROM sections WHERE project_id = ?)`,
    [id],
  );

  const apply = db.transaction(() => {
    db.prepare(
      "DELETE FROM tasks WHERE section_id IN (SELECT id FROM sections WHERE project_id = ?)",
    ).run(id);
    db.prepare("DELETE FROM sections WHERE project_id = ?").run(id);
    return db.prepare("DELETE FROM projects WHERE id = ?").run(id).changes;
  });
  const changes = apply();

  return { deleted: changes > 0, attachments: changes > 0 ? attachments : [] };
}

export function listSections(
  forUser?: { id: string; role: UserRole },
  projectId?: string,
): Section[] {
  const db = getDb();
  const nonLeader = forUser && forUser.role !== "leader";
  const accessSql = nonLeader
    ? `AND EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = s.project_id AND pm.user_id = ?
    )`
    : "";

  let sql: string;
  const params: unknown[] = [];

  if (projectId) {
    sql = `SELECT s.* FROM sections s WHERE s.project_id = ? ${accessSql} ORDER BY s.sort_order ASC`;
    params.push(projectId);
    if (nonLeader) params.push(forUser.id);
  } else {
    sql = `SELECT s.* FROM sections s WHERE 1 = 1 ${accessSql} ORDER BY s.sort_order ASC`;
    if (nonLeader) params.push(forUser.id);
  }

  const rows = db.prepare(sql).all(...params) as SectionRow[];
  return rows.map(mapSection);
}

export function getSectionById(id: string): Section | null {
  const row = getDb().prepare("SELECT * FROM sections WHERE id = ?").get(id) as
    SectionRow | undefined;
  return row ? mapSection(row) : null;
}

export function createSection(input: {
  id: string;
  projectId: string;
  title: { en: string; ar: string };
  order: number;
}): Section {
  getDb()
    .prepare(
      `INSERT INTO sections (id, project_id, title_en, title_ar, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.id,
      input.projectId,
      input.title.en,
      input.title.ar,
      input.order,
    );
  return getSectionById(input.id) as Section;
}

export type SectionFieldUpdates = {
  title?: { en: string; ar: string };
  order?: number;
};

export function updateSectionFields(
  id: string,
  updates: SectionFieldUpdates,
): Section | null {
  const db = getDb();
  const sets: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) {
    sets.push("title_en = ?", "title_ar = ?");
    values.push(updates.title.en, updates.title.ar);
  }
  if (updates.order !== undefined) {
    sets.push("sort_order = ?");
    values.push(updates.order);
  }

  if (sets.length === 0) return getSectionById(id);

  values.push(id);
  db.prepare(`UPDATE sections SET ${sets.join(", ")} WHERE id = ?`).run(
    ...values,
  );
  return getSectionById(id);
}

export function deleteSection(id: string): {
  deleted: boolean;
  attachments: string[];
} {
  const db = getDb();
  const attachments = collectTaskAttachmentPaths(db, "t.section_id = ?", [id]);

  const apply = db.transaction(() => {
    db.prepare("DELETE FROM tasks WHERE section_id = ?").run(id);
    return db.prepare("DELETE FROM sections WHERE id = ?").run(id).changes;
  });
  const changes = apply();

  return { deleted: changes > 0, attachments: changes > 0 ? attachments : [] };
}

export function reorderSections(
  updates: { id: string; order: number }[],
): void {
  const db = getDb();
  const stmt = db.prepare("UPDATE sections SET sort_order = ? WHERE id = ?");
  const apply = db.transaction((items: { id: string; order: number }[]) => {
    for (const item of items) {
      stmt.run(item.order, item.id);
    }
  });
  apply(updates);
}

function getTaskRelations(
  db: Database.Database,
  taskId: string,
): {
  assignees: AssigneeRow[];
  attachments: AttachmentRow[];
} {
  const assignees = db
    .prepare(
      "SELECT user_id, price FROM task_assignees WHERE task_id = ? ORDER BY sort_order ASC",
    )
    .all(taskId) as AssigneeRow[];
  const attachments = db
    .prepare(
      "SELECT path FROM task_attachments WHERE task_id = ? ORDER BY sort_order ASC",
    )
    .all(taskId) as AttachmentRow[];
  return { assignees, attachments };
}

function rowToTask(db: Database.Database, row: TaskRow): Task {
  const { assignees, attachments } = getTaskRelations(db, row.id);
  return mapTask(row, assignees, attachments);
}

export function listTasks(
  forUser: { id: string; role: UserRole },
  filter?: { sectionId?: string; projectId?: string },
): Task[] {
  const db = getDb();
  const params: unknown[] = [];
  const where: string[] = [];

  if (filter?.sectionId) {
    where.push("t.section_id = ?");
    params.push(filter.sectionId);
  }
  if (filter?.projectId) {
    where.push("s.project_id = ?");
    params.push(filter.projectId);
  }

  if (forUser.role === "member") {
    where.push(
      "EXISTS (SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = ?)",
    );
    params.push(forUser.id);
  } else if (forUser.role === "client") {
    where.push(
      `EXISTS (
        SELECT 1 FROM project_members pm
        WHERE pm.project_id = s.project_id AND pm.user_id = ?
      )`,
    );
    params.push(forUser.id);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const rows = db
    .prepare(
      `SELECT t.* FROM tasks t
       JOIN sections s ON s.id = t.section_id
       ${whereClause}
       ORDER BY t.sort_order ASC`,
    )
    .all(...params) as TaskRow[];

  return rows.map((row) => rowToTask(db, row));
}

export function getTaskById(id: string): Task | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    TaskRow | undefined;
  return row ? rowToTask(db, row) : null;
}

export function createTask(input: {
  id: string;
  sectionId: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  status: TaskStatus;
  assignedTo: string[];
  assigneePrices: { userId: string; price: number }[];
  dueDate: string;
  priority: Priority;
  tags: string[];
  order: number;
}): Task {
  const db = getDb();
  const now = new Date().toISOString();
  const priceByUser = new Map(
    input.assigneePrices.map((p) => [p.userId, p.price]),
  );

  const apply = db.transaction(() => {
    db.prepare(
      `INSERT INTO tasks (id, section_id, title_en, title_ar, description_en, description_ar, status, due_date, priority, tags, sort_order, created_at, updated_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      input.id,
      input.sectionId,
      input.title.en,
      input.title.ar,
      input.description.en,
      input.description.ar,
      input.status,
      input.dueDate,
      input.priority,
      JSON.stringify(input.tags),
      input.order,
      now,
      now,
      input.status === "done" ? now : null,
    );

    const insertAssignee = db.prepare(
      "INSERT OR IGNORE INTO task_assignees (task_id, user_id, price, sort_order) VALUES (?, ?, ?, ?)",
    );
    input.assignedTo.forEach((userId, index) => {
      insertAssignee.run(
        input.id,
        userId,
        priceByUser.has(userId) ? (priceByUser.get(userId) as number) : null,
        index,
      );
    });
  });
  apply();

  return getTaskById(input.id) as Task;
}

export type TaskFieldUpdates = {
  sectionId?: string;
  title?: { en: string; ar: string };
  description?: { en: string; ar: string };
  status?: TaskStatus;
  assignedTo?: string[];
  assigneePrices?: { userId: string; price: number }[];
  dueDate?: string;
  priority?: Priority;
  tags?: string[];
  order?: number;
  attachments?: string[];
};

export function updateTaskFields(
  id: string,
  updates: TaskFieldUpdates,
): { task: Task | null; removedAttachments: string[] } {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
    TaskRow | undefined;
  if (!existing) return { task: null, removedAttachments: [] };

  const now = new Date().toISOString();
  const sets: string[] = [];
  const values: unknown[] = [];
  let removedAttachments: string[] = [];

  if (updates.sectionId !== undefined) {
    sets.push("section_id = ?");
    values.push(updates.sectionId);
  }
  if (updates.title !== undefined) {
    sets.push("title_en = ?", "title_ar = ?");
    values.push(updates.title.en, updates.title.ar);
  }
  if (updates.description !== undefined) {
    sets.push("description_en = ?", "description_ar = ?");
    values.push(updates.description.en, updates.description.ar);
  }
  if (updates.status !== undefined) {
    sets.push("status = ?", "completed_at = ?");
    values.push(updates.status, updates.status === "done" ? now : null);
  }
  if (updates.dueDate !== undefined) {
    sets.push("due_date = ?");
    values.push(updates.dueDate);
  }
  if (updates.priority !== undefined) {
    sets.push("priority = ?");
    values.push(updates.priority);
  }
  if (updates.tags !== undefined) {
    sets.push("tags = ?");
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.order !== undefined) {
    sets.push("sort_order = ?");
    values.push(updates.order);
  }

  sets.push("updated_at = ?");
  values.push(now);
  values.push(id);

  const apply = db.transaction(() => {
    db.prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`).run(
      ...values,
    );

    if (
      updates.assignedTo !== undefined ||
      updates.assigneePrices !== undefined
    ) {
      const assignedTo =
        updates.assignedTo ??
        (
          db
            .prepare(
              "SELECT user_id FROM task_assignees WHERE task_id = ? ORDER BY sort_order ASC",
            )
            .all(id) as { user_id: string }[]
        ).map((r) => r.user_id);

      const previousPrices = new Map(
        (
          db
            .prepare(
              "SELECT user_id, price FROM task_assignees WHERE task_id = ?",
            )
            .all(id) as AssigneeRow[]
        )
          .filter((r) => r.price !== null && r.price !== undefined)
          .map((r) => [r.user_id, r.price as number]),
      );
      const newPrices = new Map(
        (updates.assigneePrices ?? []).map((p) => [p.userId, p.price]),
      );

      db.prepare("DELETE FROM task_assignees WHERE task_id = ?").run(id);
      const insertAssignee = db.prepare(
        "INSERT OR IGNORE INTO task_assignees (task_id, user_id, price, sort_order) VALUES (?, ?, ?, ?)",
      );
      assignedTo.forEach((userId, index) => {
        const price = newPrices.has(userId)
          ? (newPrices.get(userId) as number)
          : (previousPrices.get(userId) ?? null);
        insertAssignee.run(id, userId, price, index);
      });
    }

    if (updates.attachments !== undefined) {
      const oldPaths = (
        db
          .prepare(
            "SELECT path FROM task_attachments WHERE task_id = ? ORDER BY sort_order ASC",
          )
          .all(id) as AttachmentRow[]
      ).map((r) => r.path);

      removedAttachments = oldPaths.filter(
        (p) => !updates.attachments!.includes(p),
      );

      db.prepare("DELETE FROM task_attachments WHERE task_id = ?").run(id);
      const insertAttachment = db.prepare(
        "INSERT OR IGNORE INTO task_attachments (task_id, path, sort_order) VALUES (?, ?, ?)",
      );
      updates.attachments.forEach((attachmentPath, index) => {
        insertAttachment.run(id, attachmentPath, index);
      });
    }
  });
  apply();

  const projectId = getSectionProjectId(
    updates.sectionId ?? existing.section_id,
  );
  if (projectId) recomputeProjectEndDate(projectId);

  return { task: getTaskById(id), removedAttachments };
}

export function deleteTask(id: string): {
  deleted: boolean;
  attachments: string[];
} {
  const db = getDb();
  const existing = db
    .prepare("SELECT section_id FROM tasks WHERE id = ?")
    .get(id) as { section_id: string } | undefined;
  if (!existing) return { deleted: false, attachments: [] };

  const attachments = collectTaskAttachmentPaths(db, "t.id = ?", [id]);
  const changes = db.prepare("DELETE FROM tasks WHERE id = ?").run(id).changes;

  if (changes > 0) {
    const projectId = getSectionProjectId(existing.section_id);
    if (projectId) recomputeProjectEndDate(projectId);
  }

  return { deleted: changes > 0, attachments: changes > 0 ? attachments : [] };
}

export function reorderTasks(
  updates: { id: string; order: number; sectionId?: string }[],
): void {
  const db = getDb();
  const apply = db.transaction(
    (items: { id: string; order: number; sectionId?: string }[]) => {
      for (const item of items) {
        if (item.sectionId) {
          db.prepare(
            "UPDATE tasks SET sort_order = ?, section_id = ?, updated_at = ? WHERE id = ?",
          ).run(item.order, item.sectionId, new Date().toISOString(), item.id);
        } else {
          db.prepare(
            "UPDATE tasks SET sort_order = ?, updated_at = ? WHERE id = ?",
          ).run(item.order, new Date().toISOString(), item.id);
        }
      }
    },
  );
  apply(updates);
}

export function recomputeProjectEndDate(projectId: string): void {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT MAX(t.due_date) AS maxDue FROM tasks t
       JOIN sections s ON s.id = t.section_id
       WHERE s.project_id = ? AND t.due_date != ''`,
    )
    .get(projectId) as { maxDue: string | null };

  if (!row.maxDue) return;

  db.prepare(
    "UPDATE projects SET end_date = ?, updated_at = ? WHERE id = ?",
  ).run(row.maxDue, new Date().toISOString(), projectId);
}

export function isPathInsidePublicImages(targetPath: string): boolean {
  const baseDir = path.join(PUBLIC_DIR, "images");
  const resolvedTarget = path.resolve(targetPath);
  const resolvedBase = path.resolve(baseDir);
  const relative = path.relative(resolvedBase, resolvedTarget);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

export function cleanupAttachmentFiles(attachmentPaths: string[]): void {
  const dirs = new Set<string>();

  for (const attachmentPath of attachmentPaths) {
    const fullPath = path.resolve(PUBLIC_DIR, attachmentPath);
    if (!isPathInsidePublicImages(fullPath)) continue;

    try {
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) continue;
      fs.unlinkSync(fullPath);
      dirs.add(path.dirname(fullPath));
    } catch {
      continue;
    }
  }

  for (const dir of dirs) {
    let current = dir;
    const imagesRoot = path.resolve(PUBLIC_DIR, "images");
    while (
      current.startsWith(imagesRoot + path.sep) &&
      current !== imagesRoot
    ) {
      try {
        fs.rmdirSync(current);
        current = path.dirname(current);
      } catch {
        break;
      }
    }
  }
}
