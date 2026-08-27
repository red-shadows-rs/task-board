# Contributing to TaskBoard

Contributions to TaskBoard are welcome. This document describes the development workflow.

## 🌿 Branch Naming

Use the following prefixes for branches:

- `feature/` - new features
- `fix/` - bug fixes
- `docs/` - documentation changes
- `chore/` - maintenance tasks

Example: `feature/task-dependencies`

## 💬 Commit Convention

Commit messages follow this format:

```text
task-board | <type>: <description>
task-board | vX.Y.Z | <type>: <description>
```

- `<type>` is one of `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- `vX.Y.Z` is the current version. Release commits use it.
- A release ships as ONE commit: the pending feature work plus the version bump,
  tagged `vX.Y.Z` (there is no separate `release:` bump commit).

Example: `task-board | v4.2.0 | fix: redact assignee prices from member API responses`

## 💅 Code Style

TaskBoard is written in **TypeScript** (strict mode) with **Next.js 16**.

- ESLint 9 flat config with typescript-eslint - no new warnings allowed.
- Prettier formatting: 2-space indentation, LF line endings, semicolons.
- Every change must pass `npm run validate` (format + lint + type-check) before committing.

## ✅ Pull Requests

1. Fork the repo and create a branch from `main`.
2. Make sure `npm run validate` passes.
3. Describe your change in `CHANGELOG.md` under `[Unreleased]` (rotated into a versioned block at release time).
4. Fill in the PR template checklist.
5. Target the `main` branch.

## 🚀 Release Process (maintainers)

A release is ONE commit containing the pending work plus the version bump:

1. Bump the `version` field in `package.json`.
2. Rotate the version badges in `README.md`, `README_AR.md` and `SECURITY.md`
   (`version-X.Y.Z` / `الإصدار-X.Y.Z`).
3. Move the `CHANGELOG.md` `[Unreleased]` section into a `## [vX.Y.Z]` block dated today.
4. Commit everything as one release commit and tag it:

```bash
git add -A
git commit -m "task-board | vX.Y.Z | feat: one-line summary of the release"
git tag -a vX.Y.Z -m "task-board vX.Y.Z"
```

Then push the result:

```bash
git push origin main --follow-tags
```

The tag push triggers the [release workflow](.github/workflows/release.yml), which
verifies the version against `package.json`, runs lint/type-check/build, and publishes
a GitHub release with the notes extracted from `CHANGELOG.md`.

---

<div align="center">

Built by <a href="https://github.com/Shadow-x78">Shadow-x78</a> ·
<a href="https://github.com/red-shadows-rs">RED SHADOWS | RS</a> ·
[Back to README](README.md)

<sub>&copy; 2026 TaskBoard</sub>

</div>
