# TaskBoard for VS Code

Manage your [TaskBoard](https://github.com/) projects, sections, and tasks without leaving VS Code. The extension uses **100% native VS Code UI** — no webviews — with three organized panels in a dedicated Activity Bar container, just like native sidebar extensions.

## Design

The TaskBoard Activity Bar icon opens three native panels:

| Panel | Contents |
| --- | --- |
| **Account** | Signed-in user and role, server URL, open/completed task counts, sign out, and a shortcut to the web dashboard. |
| **My Tasks** | Tasks assigned to you, grouped by status (In Progress, In Review, To Do, Done) with section context. |
| **Projects** | Full Projects → Sections → Tasks tree with per-section progress (`done/total`). |

## Features

- **Sign in** to your TaskBoard instance with your email and password (token stored in SecretStorage).
- **Browse** Projects → Sections → Tasks in a native tree view.
- **Create tasks** in any section (leader/client roles) via inline `+` button.
- **Update task status** with a quick pick — inline checklist button on hover (respects your role's permissions).
- **Colored status icons**: spinning sync (in progress), eye (in review), green check (done), overdue task warnings.
- **Open in browser** to jump to the project or dashboard on the web app.
- **Status bar** badge showing how many open tasks are assigned to you.

## Requirements

- A running TaskBoard server that supports the external API client.
  - The server must return a `sessionToken` in the login response when the
    `x-taskboard-client: vscode` header is sent. This requires the TaskBoard
    backend changes (Bearer token support in `getSession` and `sessionToken`
    in the login response).

## Getting Started

1. Set `taskboard.baseUrl` to your TaskBoard URL (you will be prompted on first sign-in if not set). For example:

   ```jsonc
   {
     "taskboard.baseUrl": "https://taskboard.example.com"
   }
   ```

2. Open the **TaskBoard** icon in the Activity Bar and click **Sign In**, or run `TaskBoard: Sign In`.
3. Enter your email and password.

## Configuration

| Setting | Description | Default |
| --- | --- | --- |
| `taskboard.baseUrl` | Base URL of your TaskBoard deployment. | `http://localhost:3000` |
| `taskboard.refreshIntervalSeconds` | Auto-refresh interval in seconds (`0` disables). | `0` |

## Commands

| Command | Description |
| --- | --- |
| `TaskBoard: Sign In` | Sign in to TaskBoard. |
| `TaskBoard: Sign Out` | Clear the local session. |
| `TaskBoard: Refresh` | Reload projects, sections, and tasks. |
| `TaskBoard: Set Status` | Update the status of a task (context menu). |
| `TaskBoard: New Task` | Create a task in a section (context menu). |
| `TaskBoard: Open in Browser` | Open the project in your browser (context menu). |
| `TaskBoard: Open Dashboard` | Open the TaskBoard web dashboard. |
| `TaskBoard: Focus Projects` | Focus the Projects view. |
| `TaskBoard: Focus My Tasks` | Focus the My Tasks view. |

## Role Behavior

The extension mirrors the TaskBoard permission model:

- **Members** can only update the status of tasks assigned to them and cannot mark tasks as `done`.
- **Clients** and **leaders** can create tasks and update statuses (clients cannot set assignee pricing, which the extension does not manage).

## Security

- Your session token is stored in VS Code's [SecretStorage](https://code.visualstudio.com/api/references/vscode-api#SecretStorage), never in plain settings.
- All requests are sent to the configured `taskboard.baseUrl` with an `Authorization: Bearer <token>` header.

## Development

```bash
cd vscode-extension
npm install
npm run build      # bundle to dist/extension.js
npm run watch      # rebuild on change
```

Press `F5` in VS Code to launch an Extension Development Host with the extension loaded.

To produce an installable `.vsix`:

```bash
npm run package
```
