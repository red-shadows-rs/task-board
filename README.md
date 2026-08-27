<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/favicon.svg">
  <img alt="TaskBoard" src="public/favicon.svg" width="96" height="96">
</picture>

# TaskBoard

Professional bilingual task management for teams & managers - Kanban, roles, analytics, one self-hosted app

[![Version](https://img.shields.io/badge/version-4.2.0-2563eb?style=flat-square&logo=semver)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)](LICENSE)
![Framework](https://img.shields.io/badge/framework-Next.js%2016-000000?style=flat-square&logo=nextdotjs)
![Database](https://img.shields.io/badge/database-SQLite-003b57?style=flat-square&logo=sqlite)
[![Stars](https://img.shields.io/github/stars/red-shadows-rs/task-board?style=flat-square&color=eab308&logo=github)](https://github.com/red-shadows-rs/task-board/stargazers)

</div>

---

## 🌐 Language

<a href="README.md">🇬🇧 English</a> · <a href="README_AR.md">🇸🇦 العربية</a>

---

## 📋 Table of Contents

- [What is TaskBoard?](#what-is-taskboard)
- [Roles & Permissions](#roles--permissions)
- [Quick Start](#quick-start)
- [Commands](#commands)
- [Environment Variables](#environment-variables)
- [Features](#features)
- [VS Code Extension](#vs-code-extension)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Security](#security)
- [Changelog](#changelog)
- [License](#license)

---

<a id="what-is-taskboard"></a>
## 🤔 What is TaskBoard?

**TaskBoard** is a free, open-source task management system for bilingual teams - built natively in English and Arabic (full RTL layout) and written to fix the root problems found in hosted tools. No per-seat pricing, no external services, no lock-in.

| Problem                    | Hosted Tools                       | TaskBoard                                               |
| -------------------------- | ---------------------------------- | ------------------------------------------------------- |
| Arabic is an afterthought  | ❌ Broken RTL, untranslated fields | ✅ Bilingual everywhere - titles, descriptions, reports |
| Per-seat subscriptions     | ❌ Monthly cost per user           | ✅ Self-hosted, MIT licensed                            |
| External database services | ❌ Managed DB required             | ✅ Embedded SQLite - zero dependencies                  |
| Weak role separation       | ❌ Everyone sees everything        | ✅ Server-enforced leader / member / client scopes      |
| No native reporting        | ❌ Export behind paywalls          | ✅ Bilingual PDF reports built in                       |

---

<a id="roles--permissions"></a>
## 👥 Roles & Permissions

| Role       | Scope               | Can Do                                                                       |
| ---------- | ------------------- | ---------------------------------------------------------------------------- |
| **leader** | Everything          | Manage projects, sections, tasks, users, prices - full CRUD everywhere       |
| **member** | Assigned tasks only | View assigned tasks, update their status, work on their own kanban items     |
| **client** | Own projects only   | Track project progress, edit tasks inside their projects, join the team view |

All permissions are enforced **server-side** on every API route - the UI simply mirrors what the backend allows. Task prices (`assigneePrices`) are visible to leaders only and stripped from every other response.

---

<a id="quick-start"></a>
## 🚀 Quick Start

```bash
git clone https://github.com/red-shadows-rs/task-board.git
cd task-board
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Account

On an empty database the **first account created is auto-promoted to leader** (bootstrap mode). After that, only leaders can create and manage users from the Team page.

### Production

```bash
npm run build
npm start
```

Requirements:

- Node.js >= 20
- npm >= 10

---

<a id="commands"></a>
## ⌨️ Commands

| Command                | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| `npm run dev`          | Start dev server with Turbopack                                        |
| `npm run build`        | Production build                                                       |
| `npm start`            | Start production server                                                |
| `npm run lint`         | Run ESLint                                                             |
| `npm run lint:fix`     | Auto-fix lint issues                                                   |
| `npm run format`       | Format with Prettier                                                   |
| `npm run format:check` | Check formatting                                                       |
| `npm run type-check`   | TypeScript type checking                                               |
| `npm run validate`     | Full validation (format + lint + types) - required before every commit |

---

<a id="environment-variables"></a>
## 🔧 Environment Variables

Copy `.env.example` to `.env.local` before first run:

| Variable         | Required | Default | Description                                                                              |
| ---------------- | -------- | ------- | ---------------------------------------------------------------------------------------- |
| `SESSION_SECRET` | Yes      | —       | HMAC-SHA256 signing key for sessions - random string of **at least 32 characters**       |
| `TRUST_PROXY`    | No       | unset   | Set `true` only behind a trusted reverse proxy to enable per-IP rate limiting            |

The app refuses to boot without a strong `SESSION_SECRET` (generate one with `openssl rand -base64 48`).

---

<a id="features"></a>
## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>🎯 Core</h3>
      <ul>
        <li><strong>Kanban Board</strong> — Drag-and-drop tasks across customizable sections</li>
        <li><strong>Project Management</strong> — Create, edit, and track projects with statuses</li>
        <li><strong>Task Management</strong> — Rich text descriptions, attachments, tags, priorities</li>
        <li><strong>Team Management</strong> — Role-based access: leader, member, client</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📊 Analytics & Reporting</h3>
      <ul>
        <li><strong>Analytics Dashboard</strong> — Interactive charts via Recharts</li>
        <li><strong>PDF Export</strong> — Projects, sections, tasks, and analytics reports</li>
        <li><strong>Progress Tracking</strong> — Visual indicators for project and task status</li>
        <li><strong>Task Pricing</strong> — Per-assignee prices with column totals (leaders only)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🎨 User Experience</h3>
      <ul>
        <li><strong>Bilingual (EN/AR)</strong> — Full RTL support with Cairo/Inter fonts</li>
        <li><strong>Dark/Light Theme</strong> — System-aware HSL-based theming</li>
        <li><strong>Rich Text Editor</strong> — Tiptap with text alignment and underline</li>
        <li><strong>PWA Ready</strong> — Installable with offline manifest</li>
        <li><strong>Responsive</strong> — Desktop, tablet, and mobile optimized</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🔒 Security</h3>
      <ul>
        <li><strong>Session Auth</strong> — bcrypt + HMAC-SHA256 httpOnly cookies and Bearer tokens, invalidated on password change</li>
        <li><strong>Rate Limiting</strong> — Per-account on login, per-IP behind a trusted proxy</li>
        <li><strong>Input Validation</strong> — Zod schemas on all API routes</li>
        <li><strong>XSS Protection</strong> — DOMPurify sanitization</li>
        <li><strong>Security Headers</strong> — X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, CSP (report-only), HSTS</li>
        <li><strong>Authenticated Uploads</strong> — Attachments stored outside <code>public/</code> and served only through the authorized API</li>
      </ul>
    </td>
  </tr>
</table>

---

<a id="vs-code-extension"></a>
## 📦 VS Code Extension

Manage your tasks without leaving the editor. The extension in [`vscode-extension/`](vscode-extension/) is built **100% on native VS Code APIs — no webviews** — and mirrors the web app's permission model.

- **Activity Bar container** with three native panels: **Account** (user, role, server, stats, dashboard shortcut), **My Tasks** (assigned tasks grouped by status), and **Projects** (full Projects → Sections → Tasks tree with progress).
- **Quick actions** — change task status via Quick Pick, create tasks, open anything in the browser (inline buttons on hover).
- **Status bar badge** with your open task count; auto-refresh option.
- **Secure by default** — session token in VS Code SecretStorage, Bearer-token API auth, cleartext-HTTP warning.

```bash
cd vscode-extension
npm install && npm run build
# Press F5 to launch an Extension Development Host, or:
npm run package && code --install-extension taskboard-vscode-0.2.0.vsix
```

Full documentation in [vscode-extension/README.md](vscode-extension/README.md).

---

<a id="tech-stack"></a>
## 🧩 Tech Stack

| Category          | Technology                                                                                                        | Purpose                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Framework**     | [Next.js 16](https://nextjs.org/)                                                                                 | App Router + Turbopack |
| **UI**            | [React 18](https://react.dev/) + [Radix UI](https://www.radix-ui.com/)                                            | Component primitives   |
| **Styling**       | [Tailwind CSS 3](https://tailwindcss.com/)                                                                        | Utility-first CSS      |
| **Language**      | [TypeScript 5](https://www.typescriptlang.org/)                                                                   | Type safety            |
| **Database**      | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)                                                      | Embedded SQLite        |
| **Auth**          | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + HMAC-SHA256                                                    | Sessions               |
| **Drag & Drop**   | [dnd-kit](https://dndkit.com/)                                                                                    | Kanban reordering      |
| **Rich Text**     | [Tiptap](https://tiptap.dev/)                                                                                     | Task descriptions      |
| **Forms**         | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                                         | Validation             |
| **State**         | [Zustand](https://zustand.docs.pmnd.rs/)                                                                          | Global UI state        |
| **Charts**        | [Recharts](https://recharts.org/)                                                                                 | Analytics              |
| **PDF**           | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Export                 |
| **Animations**    | [Framer Motion](https://www.framer.com/motion/)                                                                   | Transitions            |
| **Notifications** | [react-hot-toast](https://react-hot-toast.com/)                                                                   | Toast alerts           |
| **Dates**         | [date-fns](https://date-fns.org/) + [react-day-picker](https://react-day-picker.js.org/)                          | Date handling          |
| **Icons**         | [Lucide React](https://lucide.dev/)                                                                               | Iconography            |
| **VS Code Client**| [VS Code Extension API](https://code.visualstudio.com/api)                                                        | `vscode-extension/`    |
| **Linting**       | [ESLint 9](https://eslint.org/) (flat config)                                                                     | Code quality           |
| **Formatting**    | [Prettier](https://prettier.io/)                                                                                  | Code style             |

---

<a id="project-structure"></a>
## 🏗️ Project Structure

```
TaskBoard/
├── data/                       # SQLite database + attachment images (runtime)
├── public/
│   ├── fonts/                  # IBM Plex Sans Arabic (PDF)
│   ├── locales/                # i18n modules (en/ar)
│   └── manifest.json           # PWA manifest
├── src/
│   ├── app/
│   │   ├── api/                # REST API routes
│   │   │   ├── auth/           # Login, logout, session
│   │   │   ├── images/         # Authenticated attachment serving
│   │   │   ├── locales/        # Locale module listing
│   │   │   ├── projects/       # Project CRUD + reorder
│   │   │   ├── sections/       # Section CRUD + reorder
│   │   │   ├── tasks/          # Task CRUD + reorder + images
│   │   │   ├── users/          # User CRUD + reorder
│   │   │   └── shared/         # Rate limiting, validators, responses
│   │   ├── dashboard/          # Tasks, projects, analytics, team
│   │   ├── login/              # Authentication page
│   │   └── profile/            # User profile
│   ├── components/
│   │   ├── common/             # Shared logic (kanban, tasks, charts)
│   │   ├── layouts/            # Navbar, footer
│   │   ├── pages/              # Page-level components
│   │   └── ui/                 # UI primitives (shadcn/ui-style)
│   ├── contexts/               # Language + Zustand store
│   ├── lib/
│   │   ├── auth.ts             # Session signing, RBAC guards
│   │   └── db.ts               # SQLite schema + data layer
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # PDF export, pricing
├── scripts/                    # Locale parity checker
├── vscode-extension/           # Native VS Code extension (own package)
├── .github/                    # Issue/PR templates, CI, release workflow
├── CHANGELOG.md                # Release history
├── LICENSE                     # MIT
└── README.md                   # This file
```

---

<a id="roadmap"></a>
## 🗺️ Roadmap

- [x] Embedded database (SQLite via better-sqlite3)
- [x] Native VS Code extension
- [ ] Email notifications for task assignments
- [ ] OAuth2 / social login support
- [ ] WebSocket real-time updates
- [ ] Docker deployment configuration
- [ ] Unit and integration tests

---

<a id="contributing"></a>
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Full workflow, commit convention and release process in [CONTRIBUTING.md](CONTRIBUTING.md).

---

<a id="security"></a>
## 🔒 Security

To report a security vulnerability, please follow the [Security Policy](SECURITY.md). **Do not open a public issue.**

---

<a id="changelog"></a>
## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed version history. This project follows [Semantic Versioning](https://semver.org/).

| Version    | Date       | Highlights                                                                          |
| ---------- | ---------- | ----------------------------------------------------------------------------------- |
| **v4.2.0** | 2026-08-27 | Security audit fixes, native VS Code extension, dead-code cleanup   |
| **v4.1.1** | 2026-08-27 | Unified docs style across all markdown, SVG logo banner, kebab-case repo references |
| **v4.1.0** | 2026-08-27 | SQLite storage, server-side RBAC, hardened sessions, GitHub scaffolding             |
| **v4.0.6** | 2026-05-15 | Updated author username, set GitHub repo topics                                     |
| **v4.0.5** | 2026-05-14 | Fixed drag-and-drop on desktop, fixed metadata icons                                |
| v4.0.4     | 2026-05-14 | Removed ESLint disable comments, removed console logs                               |
| v4.0.3     | 2026-05-14 | Fixed repo links, updated branding, version bump                                    |
| v4.0.2     | 2026-05-14 | Restored original icon, added .env.example                                          |
| v4.0.1     | 2026-05-14 | Documentation overhaul, Arabic README, data cleanup                                 |
| v4.0.0     | 2026-05-14 | Analytics, PDF export, PWA, bilingual, dark/light theme                             |
| v3.0.0     | 2026-04-01 | Project/section management, task CRUD, user roles                                   |
| v2.0.0     | 2026-03-01 | Kanban board UI, statuses/priorities/tags, dashboard                                |
| v1.0.0     | 2026-02-01 | Initial setup: Next.js App Router, login, Tailwind                                  |

---

<a id="license"></a>
## 📜 License

Distributed under the [MIT License](LICENSE).

---

<div align="center">

Built by <a href="https://github.com/Shadow-x78">Shadow-x78</a> ·
<a href="https://github.com/red-shadows-rs">RED SHADOWS | RS</a> ·
[Changelog](CHANGELOG.md)

<sub>&copy; 2026 TaskBoard</sub>

</div>
