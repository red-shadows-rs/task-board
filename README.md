<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/favicon.svg">
    <img alt="TaskBoard" src="public/favicon.svg" width="96" height="96">
  </picture>
</p>

<h1 align="center">TaskBoard</h1>

<p align="center">
  <strong>Professional Task Management System for Teams &amp; Managers</strong>
</p>

<p align="center">
  <a href="https://github.com/red-shadows-rs/TaskBoard/blob/main/README_AR.md">العربية</a>
  &nbsp;&bull;&nbsp;
  <a href="#-features">Features</a>
  &nbsp;&bull;&nbsp;
  <a href="#-tech-stack">Tech Stack</a>
  &nbsp;&bull;&nbsp;
  <a href="#-getting-started">Getting Started</a>
  &nbsp;&bull;&nbsp;
  <a href="#-project-structure">Structure</a>
  &nbsp;&bull;&nbsp;
  <a href="#-contributing">Contributing</a>
  &nbsp;&bull;&nbsp;
  <a href="#-license">License</a>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/version-4.1.0-2563eb?style=for-the-badge" alt="Version 4.1.0">
  <img src="https://img.shields.io/badge/license-MIT-10b981?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3">
</p>

<br/>

---

## Why TaskBoard?

Managing projects across bilingual teams is challenging. TaskBoard bridges the gap with a Kanban-style interface that supports both English and Arabic natively — from RTL layout to bilingual task descriptions. Built on Next.js 16 with a focus on performance, security, and developer experience.

- **Bilingual by Design** — Every feature works in English and Arabic, not as an afterthought
- **Self-Contained** — Embedded SQLite database (better-sqlite3) means zero external services; deploy anywhere
- **Production-Ready** — Rate limiting, security headers, XSS protection, and session-based auth out of the box
- **Export Everything** — Generate PDF reports for projects, tasks, and analytics with bilingual font support

---

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
        <li><strong>Session Auth</strong> — bcrypt + HMAC-SHA256 httpOnly cookies</li>
        <li><strong>Rate Limiting</strong> — Per-IP on auth endpoints</li>
        <li><strong>Input Validation</strong> — Zod schemas on all API routes</li>
        <li><strong>XSS Protection</strong> — DOMPurify sanitization</li>
        <li><strong>Security Headers</strong> — X-Frame-Options, CSP, Referrer-Policy</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Tech Stack

| Category          | Technology                                                                                                        | Purpose                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Framework**     | [Next.js 16](https://nextjs.org/)                                                                                 | App Router + Turbopack |
| **UI**            | [React 18](https://react.dev/) + [Radix UI](https://www.radix-ui.com/)                                            | Component primitives   |
| **Styling**       | [Tailwind CSS 3](https://tailwindcss.com/)                                                                        | Utility-first CSS      |
| **Language**      | [TypeScript 5](https://www.typescriptlang.org/)                                                                   | Type safety            |
| **Drag & Drop**   | [dnd-kit](https://dndkit.com/)                                                                                    | Kanban reordering      |
| **Rich Text**     | [Tiptap](https://tiptap.dev/)                                                                                     | Task descriptions      |
| **Forms**         | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                                         | Validation             |
| **State**         | [Zustand](https://zustand.docs.pmnd.rs/)                                                                          | Global UI state        |
| **Charts**        | [Recharts](https://recharts.org/)                                                                                 | Analytics              |
| **PDF**           | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) | Export                 |
| **Auth**          | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) + HMAC-SHA256                                                    | Sessions               |
| **Database**      | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)                                                      | Embedded SQLite        |
| **Animations**    | [Framer Motion](https://www.framer.com/motion/)                                                                   | Transitions            |
| **Notifications** | [react-hot-toast](https://react-hot-toast.com/)                                                                   | Toast alerts           |
| **Dates**         | [date-fns](https://date-fns.org/) + [react-day-picker](https://react-day-picker.js.org/)                          | Date handling          |
| **Icons**         | [Lucide React](https://lucide.dev/) + [Font Awesome 6](https://fontawesome.com/)                                  | Iconography            |
| **Linting**       | [ESLint 9](https://eslint.org/) (flat config)                                                                     | Code quality           |
| **Formatting**    | [Prettier](https://prettier.io/)                                                                                  | Code style             |

---

## 📦 Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 10

### Quick Start

```bash
git clone https://github.com/red-shadows-rs/TaskBoard.git
cd taskboard
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Account

On first launch no users exist. The first account created through the app is
automatically promoted to **leader** (bootstrap mode); after that, only leaders
can create and manage users from the Team page.

### Environment Variables

| Variable         | Required | Default       | Description             |
| ---------------- | -------- | ------------- | ----------------------- |
| `NODE_ENV`       | Yes      | `development` | Environment mode        |
| `SESSION_SECRET` | Yes      | —             | HMAC-SHA256 signing key |

### Available Scripts

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start dev server with Turbopack         |
| `npm run build`        | Production build                        |
| `npm start`            | Start production server                 |
| `npm run lint`         | Run ESLint                              |
| `npm run lint:fix`     | Auto-fix lint issues                    |
| `npm run format`       | Format with Prettier                    |
| `npm run format:check` | Check formatting                        |
| `npm run type-check`   | TypeScript type checking                |
| `npm run validate`     | Full validation (format + lint + types) |

---

## 📁 Project Structure

```
TaskBoard/
├── data/                       # SQLite database (created at runtime)
├── public/
│   ├── css/                    # Font Awesome
│   ├── fonts/                  # IBM Plex Sans Arabic (PDF)
│   ├── images/                 # Task attachments
│   ├── locales/                # i18n (en/ar)
│   └── manifest.json           # PWA manifest
├── src/
│   ├── app/
│   │   ├── api/                # REST API routes
│   │   │   ├── auth/           # Login, logout, session
│   │   │   ├── projects/       # Project CRUD
│   │   │   ├── sections/       # Section CRUD + reorder
│   │   │   ├── tasks/          # Task CRUD + reorder + images
│   │   │   ├── users/          # User CRUD + reorder
│   │   │   └── shared/         # Rate limiting, validators, responses
│   │   ├── dashboard/          # Tasks, projects, analytics, team
│   │   ├── login/              # Authentication page
│   │   └── profile/            # User profile
│   ├── components/
│   │   ├── common/             # Shared logic
│   │   ├── layouts/            # Navbar, footer
│   │   ├── pages/              # Page-level components
│   │   └── ui/                 # UI primitives (shadcn/ui-style)
│   ├── contexts/               # Language + Zustand store
│   ├── lib/                    # Auth sessions + SQLite data layer
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # PDF export, pricing
├── CHANGELOG.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── LICENSE
├── README.md
├── README_AR.md
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗺️ Roadmap

- [x] Embedded database (SQLite via better-sqlite3)
- [ ] Email notifications for task assignments
- [ ] OAuth2 / social login support
- [ ] WebSocket real-time updates
- [ ] Docker deployment configuration
- [ ] Unit and integration tests

---

## 🤝 Contributing

We welcome contributions. Please read our [Contributing Guide](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔒 Security

To report a security vulnerability, please follow our [Security Policy](./SECURITY.md). Do not open a public issue.

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed version history. This project follows [Semantic Versioning](https://semver.org/).

| Version   | Date       | Highlights                                                                    |
| --------- | ---------- | ----------------------------------------------------------------------------- |
| **4.1.0** | 2026-08-27 | SQLite storage, server-side RBAC, hardened sessions, API cleanup              |
| **4.0.6** | 2026-05-15 | Updated author username, set GitHub repo topics                               |
| **4.0.5** | 2026-05-14 | Fixed drag-and-drop on desktop, fixed metadata icons, removed ESLint comments |
| 4.0.4     | 2026-05-14 | Removed ESLint disable comments, removed console logs, added missing tags     |
| 4.0.3     | 2026-05-14 | Fixed repo links, updated branding, version bump                              |
| 4.0.2     | 2026-05-14 | Restored original icon, added .env.example                                    |
| 4.0.1     | 2026-05-14 | Documentation overhaul, Arabic README, improved icons, data cleanup           |
| 4.0.0     | 2026-05-14 | Analytics, PDF export, PWA, bilingual, dark/light theme, drag & drop          |
| 3.0.0     | 2026-04-01 | Project/section management, task CRUD, user roles, session auth               |
| 2.0.0     | 2026-03-01 | Kanban board UI, task statuses/priorities/tags, dashboard layout              |
| 1.0.0     | 2026-02-01 | Initial setup: Next.js App Router, login page, Tailwind CSS                   |

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 👤 Author

[**Shadow-x78**](https://github.com/Shadow-x78) — RED SHADOWS | RS

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/red-shadows-rs">RED SHADOWS | RS</a></sub>
</p>
