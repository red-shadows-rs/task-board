<div align="center">

# Security Policy - TaskBoard

[![Version](https://img.shields.io/badge/version-4.1.1-2563eb?style=flat-square&logo=semver)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-10b981?style=flat-square)](LICENSE)
![Framework](https://img.shields.io/badge/framework-Next.js%2016-000000?style=flat-square&logo=nextdotjs)
![Database](https://img.shields.io/badge/database-SQLite-003b57?style=flat-square&logo=sqlite)

</div>

---

## 📋 Table of Contents

- [Supported Versions](#supported-versions)
- [Reporting a Vulnerability](#reporting)
- [Disclosure Policy](#disclosure)
- [Security Considerations](#considerations)
- [Security Measures](#measures)
- [Hall of Fame](#hall-of-fame)

---

<a id="supported-versions"></a>

## 🛡️ Supported Versions

| Version | Supported      |
| ------- | -------------- |
| 4.x     | ✅ Active      |
| < 4.0   | ❌ End of Life |

Only the latest minor release receives security updates. Ensure you are on the most recent version before reporting.

---

<a id="reporting"></a>

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability in TaskBoard, please report it **responsibly** and **privately**. **Do not open a public issue.**

**Preferred method:**

- Open a private security advisory on GitHub:
  [Security Advisories](https://github.com/red-shadows-rs/task-board/security/advisories/new)

**Alternative method:**

- GitHub direct message to [@Shadow-x78](https://github.com/Shadow-x78)

**What to include:**

| Field        | Details                                      |
| ------------ | -------------------------------------------- |
| Description  | Clear explanation of the vulnerability       |
| Reproduction | Steps to reproduce - minimal PoC if possible |
| Component    | Affected file / module and version           |
| Impact       | Privilege escalation, data exposure, etc.    |
| Fix          | Suggested mitigation (optional)              |

**Response timeline:**

| Phase                  | Timeframe                         |
| ---------------------- | --------------------------------- |
| Initial acknowledgment | Within 48 hours of receipt        |
| Status update          | Within 5 business days            |
| Resolution             | Within 30 days (critical issues)  |
| Public disclosure      | Coordinated after fix is released |

---

<a id="disclosure"></a>

## 📢 Disclosure Policy

We follow a **coordinated disclosure** model:

1. Report received and acknowledged
2. Vulnerability validated and severity assessed
3. Fix developed and tested
4. Security release published to all supported versions
5. Public disclosure with credit to reporter (if desired)

> **No premature disclosure.** Do not open public issues or pull requests for security bugs until the fix is released.

---

<a id="considerations"></a>

## 🔍 Security Considerations

### Scope

TaskBoard is a self-hosted Next.js application with an embedded SQLite database. It:

- Authenticates users with bcrypt-hashed passwords and HMAC-signed session cookies
- Enforces role-based access (leader / member / client) server-side on every API route
- Stores task attachment images under `public/images/`
- Persists all data in `data/taskboard.db`

### Known Risk Areas

| Area             | Risk                                | Mitigation                                                                                            |
| ---------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Session signing  | Forgery if `SESSION_SECRET` leaks   | HMAC-SHA256 signed httpOnly cookies; secret required at boot; sessions invalidated on password change |
| Password storage | Credential theft                    | bcrypt hashing with salt rounds; passwords never returned by the API                                  |
| File uploads     | Malicious payloads / path traversal | Upload restricted to leader/client roles, UUID-based naming, path sanitization                        |
| Role enforcement | Privilege escalation                | Every API route checks the caller's role server-side; `assigneePrices` redacted for non-leaders       |
| SQLite file      | Local data exposure                 | Keep `data/` outside the web root access of any reverse proxy; filesystem permissions                 |
| Dependencies     | Supply chain                        | `npm audit` + CI pipeline; Dependabot-style updates recommended                                       |

### Recommendations

1. **Use a long, random `SESSION_SECRET`** - the app refuses to boot without it:

   ```bash
   openssl rand -hex 64
   ```

2. **Serve behind HTTPS** - run behind a reverse proxy (nginx, Caddy, etc.) so session cookies transit encrypted.
3. **Protect `data/` and `.env.local`** - never expose them publicly; restrict filesystem permissions.
4. **Keep Node.js updated** - run on a supported LTS release (>= 20).
5. **Back up `data/taskboard.db`** - the database is a single file; include it in your backup routine.

---

<a id="measures"></a>

## 🔒 Security Measures

TaskBoard implements several security measures out of the box:

- **Session Management** - HMAC-SHA256 signed httpOnly cookies with 7-day expiry
- **Password Hashing** - bcrypt with salt rounds
- **Rate Limiting** - Per-IP rate limiting on authentication endpoints
- **Input Validation** - Zod schemas on all API routes
- **XSS Protection** - DOMPurify sanitization on user-generated content
- **Security Headers** - X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

---

<a id="hall-of-fame"></a>

## 🏆 Hall of Fame

We thank the following security researchers for responsible disclosure:

_(None yet - be the first!)_

---

<div align="center">

Built by <a href="https://github.com/Shadow-x78">Shadow-x78</a> ·
<a href="https://github.com/red-shadows-rs">RED SHADOWS | RS</a> ·
[Back to README](README.md)

<sub>&copy; 2026 TaskBoard</sub>

</div>
