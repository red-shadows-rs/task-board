# Changelog

All notable changes to this project will be documented in this file.

## [v4.2.0] - 2026-08-27

### ✨ Added
- **Native VS Code extension** (`vscode-extension/`) built entirely on native VS Code APIs (zero webviews): dedicated Activity Bar container with three panels — **Account** (user, role, server, stats), **My Tasks** (grouped by status), and **Projects** (full tree) — plus inline status/create actions, welcome screens, status-bar badge, and SecretStorage-backed sessions.
- **Bearer token API auth** for external clients: login returns `sessionToken` when the `x-taskboard-client: vscode` header is present, and every route accepts `Authorization: Bearer <token>`.
- **`TRUST_PROXY` environment variable** to enable per-IP rate limiting only behind a trusted reverse proxy.
- **Locale parity checker** (`npm run locales:check`) validating en/ar key symmetry and every `t(...)` key used in code; wired into `npm run validate`.

### 🎨 Changed
- **Attachment uploads now stored under `data/images/`** (outside `public/`) so they can never be served as static files; the `/images/:path*` rewrite is a `beforeFiles` rewrite and always routes through the authenticated API.
- **`next/image` renders attachments with `unoptimized`** so authenticated images load directly with the session cookie instead of failing in the optimizer.
- **Login rate limiting keyed per account (email)**; the spoofable `X-Forwarded-For` header is no longer trusted by default.
- **First-account bootstrap is atomic** (SQLite transaction) — exactly one leader can ever be created on an empty database, and it is rate limited.
- **Last-leader protection enforced atomically at the database layer** for both role changes and deletions.
- **Project end dates** recomputed for both the old and new project when a task moves sections, and cleared when no due dates remain.
- **bcrypt cost raised 10 → 12**; `dueDate`/`startDate`/`endDate` inputs now must be ISO `YYYY-MM-DD` or empty.
- **Config-file comments unified** on the banner style (`.env.example`, `.env.local`, `.gitignore`, `.editorconfig`, `.gitattributes`); all comments removed from source code.
- **Root `tsconfig.json`** excludes the self-contained `vscode-extension` package and drops the dead `**/*.mts` glob.

### 🐛 Fixed
- Uploaded images were served **unauthenticated** as static files from `public/`, bypassing the image API auth entirely.
- `/api/images/[...path]` lacked per-project authorization — any signed-in user could read any project's images.
- A client could **delete other tasks'/projects' attachment files** by PATCHing a crafted `attachments` array; unknown paths are now rejected.
- Rate limiter wiped **all** buckets when exceeding 10,000 entries (now evicts oldest entries).
- Without `X-Forwarded-For`, every client shared one `"unknown"` rate-limit bucket, locking all users out after 5 logins.
- Broken `@font-face` blocks in the bundled Font Awesome CSS blanked the login/error page icons — Font Awesome removed, icons migrated to `lucide-react`.
- Missing translation keys `common.nav.menu`, `dashboard.analytics.filters.dateRange`, and the hardcoded chart error string.

### 🔒 Security
- **Content-Security-Policy (report-only)** and **Strict-Transport-Security** headers added.
- **`SESSION_SECRET` strength enforced** at startup: at least 32 characters and never the documented placeholder.
- **SVG removed from the upload MIME allow-list**; sharp capped at 16 megapixels (`limitInputPixels`) to block decompression bombs.
- **DOMPurify hardened** with explicit `FORBID_TAGS` (`svg`, `math`, `form`, `style`, `input`) and forbidden attributes.

### 🗑️ Removed
- Dead code: `requireRoles`, `isMemberOfProject`, `getTaskProjectId`, `isProjectMember`, `calculateSectionTotal`, `taskAssigneeUpdateSchema`, `AvatarImage`, plus 14 unnecessary public exports made internal.
- `public/css/font-awesome.min.css` and `public/webfonts/`, `public/images/`, and `.playwright-mcp/` tooling artifacts.

## [v4.1.1] - 2026-08-27

### ✨ Added
- **`[Unreleased]` changelog section** workflow for pending changes, rotated into a versioned block at release time per the CONTRIBUTING release process.

### 🎨 Changed
- **README.md fully restructured** to the unified project style: SVG logo banner, flat-square badges, table of contents with anchor links, bilingual language switcher, problem comparison table, roles matrix, expanded quick start, commands and environment tables, refreshed features/tech stack/structure sections.
- **All repository references switched to kebab-case** (`red-shadows-rs/task-board`): `package.json` name, README_AR, CONTRIBUTING and CHANGELOG links.
- **All markdown files unified on one documentation style** (README_AR.md, CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md).

## [v4.1.0] - 2026-08-26

### ✨ Added
- **SQLite storage** via `better-sqlite3`, replacing the JSON file database; data now lives in `data/taskboard.db`
- **Bootstrap leader** - the first user created on an empty database is auto-promoted to leader
- **Server-enforced role-based access** on every API route (leader / member / client)
- **Session hardening** - HMAC-signed httpOnly sessions, invalidation on password change, `SESSION_SECRET` required

### 🎨 Changed
- **Members** can only view and update status on tasks assigned to them; prices are hidden
- **Clients** scoped to their own projects; cannot delete tasks or change assignee pricing
- **Price data** (`assigneePrices`) stripped from all non-leader API responses
- **Task fetch** on the project detail page now uses `GET /api/tasks?projectId=…` instead of a `POST`-as-query hack
- **Member edit dialog** keeps password in separate draft state instead of binding to the user object

### 🐛 Fixed
- Members could previously delete tasks and sections via the API
- Passwords were sent in plain user payloads on member update

### 🔒 Security
- Rate limiting on login and user creation, security headers, and XSS sanitization retained

## [v4.0.6] - 2026-05-15

### 🎨 Changed
- **Updated author username** from SHADOW_x7 to Shadow-x78 with GitHub link in README, LICENSE, and package.json

## [v4.0.5] - 2026-05-14

### 🐛 Fixed
- **Fixed drag-and-drop** on desktop by lowering mobile breakpoint from 1024px to 768px
- **Fixed metadata icons** to reference existing SVG files instead of missing WebP files
- **Moved Font Awesome CSS** import from `<link>` tag to `@import` in globals.css

### 🗑️ Removed
- **Removed ESLint disable comment** for Font Awesome CSS link

## [v4.0.4] - 2026-05-14

### 🎨 Changed
- **Removed ESLint disable comments** from layout.tsx
- **Removed console.log/error statements** from error.tsx and pdfUtil.ts
- **Added missing version tags** for v4.0.0 through v4.0.4

## [v4.0.3] - 2026-05-14

### 🎨 Changed
- **Updated repository links** from `SHADOW-x7/taskboard` to `red-shadows-rs/TaskBoard`
- **Updated branding** from `RED SHADOWS` to `RED SHADOWS | RS`

## [v4.0.2] - 2026-05-14

### ✨ Added
- **`.env.example`** file with placeholder values for required environment variables

### 🎨 Changed
- **Restored original icon design** - simple 4-rectangle Kanban board SVG replacing the gradient design

## [v4.0.1] - 2026-05-14

### ✨ Added
- **Arabic README** (`README.ar.md`) with full RTL-formatted documentation
- **Contributing Guide** (`CONTRIBUTING.md`) with commit format, code style, and PR workflow
- **Code of Conduct** (`CODE_OF_CONDUCT.md`) based on Contributor Covenant v2.1
- **Security Policy** (`SECURITY.md`) with vulnerability reporting process and supported versions

### 🎨 Changed
- **Redesigned SVG icon** with gradient Kanban board design replacing low-resolution WebP icons
- **Reorganized English README** with professional layout, badges, roadmap, and improved structure
- **Updated PWA manifest** to use SVG icon instead of multiple WebP sizes
- **Cleaned sample data** from all database JSON files (now empty arrays for fresh starts)
- **Removed uploaded images** from `public/images/` directory
- **Fixed `.gitignore`** to track database files and image directory structure

### 🗑️ Removed
- Low-resolution WebP icon files (`icon-*.webp`, `favicon.webp`, `apple-touch-icon.webp`)

## [v4.0.0] - 2026-05-14

### ✨ Added
- **Analytics Dashboard** with interactive charts (Recharts) for project progress, task distribution, and team performance
- **PDF Export Engine** for projects, sections, tasks, and analytics reports (jsPDF + jspdf-autotable)
- **PWA Support** with manifest.json, service worker, and multiple icon sizes (16px to 512px)
- **Team Management Page** with member listing, role assignment, and reordering
- **Profile Page** for editing user name, email, and password
- **Rich Text Editor** for task descriptions (Tiptap with starter-kit, placeholder, text-align, and underline extensions)
- **Drag & Drop Reordering** for tasks and sections (dnd-kit)
- **Bilingual Support** (English/Arabic) with dynamic locale loading, RTL layout, Cairo/Inter fonts
- **Dark/Light Theme** with system preference detection and HSL-based CSS custom properties
- **Rate Limiting** on authentication endpoints (in-memory, per-IP)
- **Security Headers** via next.config.ts (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- **Global Error Boundary** and custom 404 page
- **Scroll-to-Top** button component
- **Loading States** with skeleton components across all pages
- **Font Awesome 6** icon library integration
- **IBM Plex Sans Arabic** font for PDF exports

### 🎨 Changed
- Upgraded to Next.js 16 with Turbopack dev server
- Migrated to ESLint 9 flat config
- Replaced basic text inputs with Tiptap rich text editor for task descriptions
- Enhanced task model with attachments, assignee pricing, and bilingual fields
- Improved form validation with Zod schemas across all API routes

### 🐛 Fixed
- Session cookie security (httpOnly, secure in production, sameSite strict)
- Image upload path sanitization and UUID-based naming

## [v3.0.0] - 2026-04-01

### ✨ Added
- **Project Management** with CRUD operations and status tracking (planning, active, completed, on_hold)
- **Section Management** within projects (Kanban columns)
- **Task CRUD** with file attachments stored in `public/images/`
- **User Roles** system: leader, member, client with role-based access control
- **Session-Based Authentication** with bcrypt password hashing and HMAC-SHA256 signed cookies
- **JSON File Database** layer with generic CRUD operations (`databaseShared.ts`)
- **Zod Validation** for all API inputs (`validatorsShared.ts`)
- **Zustand** global state management for UI state
- **Framer Motion** animations for page transitions and UI interactions
- **react-hot-toast** notification system
- **DOMPurify** for XSS sanitization of user-generated content
- **date-fns** for date formatting and manipulation
- **react-day-picker** date picker component
- **API Routes** for projects, sections, tasks, users, and authentication
- **Dashboard Layout** with authenticated route guard, navbar, and footer

### 🎨 Changed
- Migrated from client-side state to server-side JSON persistence
- Reorganized component architecture into `common/`, `layouts/`, `pages/`, and `ui/` directories
- Standardized UI components with class-variance-authority and tailwind-merge

## [v2.0.0] - 2026-03-01

### ✨ Added
- **Kanban Board UI** with task cards and column layout
- **Task Statuses**: todo, in_progress, in_review, done
- **Task Priorities**: low, medium, high, urgent
- **Task Tags** system (Frontend, Backend, etc.)
- **Due Dates** with visual indicators
- **Dashboard Layout** with responsive navbar and footer
- **Basic i18n Structure** with locale JSON files for auth, common, and dashboard sections
- **Language Context** with dynamic locale loading
- **Theme Provider** with next-themes integration
- **shadcn/ui Components**: Button, Input, Card, Dialog, DropdownMenu, Select, Badge, Avatar, Tabs, Separator, Popover, AlertDialog, Sheet, Label, Calendar
- **Lucide React** icon library
- **Tailwind CSS** with custom theme configuration and CSS variables
- **PostCSS** with autoprefixer

### 🎨 Changed
- Redesigned login page with form validation and error handling
- Improved TypeScript strict mode configuration

## [v1.0.0] - 2026-02-01

### ✨ Added
- **Next.js App Router** project initialization with TypeScript
- **Login Page** with basic form and routing
- **Root Layout** with metadata configuration
- **Route Redirect** from `/` to `/login`
- **Tailwind CSS** setup with base configuration
- **ESLint** and **Prettier** configuration
- **TypeScript** strict mode with path aliases (`@/*`)
- **Basic Project Structure**: `src/app/`, `src/components/`, `src/types/`, `src/utils/`
- **Type Definitions** for core entities (User, Project, Section, Task)
- **Font Awesome** CSS integration
- **PWA Icons** and manifest scaffolding
