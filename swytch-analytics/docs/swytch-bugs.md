# SwytchCode CLI Bug Report Log

> Only high-impact issues affecting reliability and integration are listed.

---

## Known Critical Issues

---

### BUG-001 — Method not auto-registered in tooling.json

| Field    | Detail |
|----------|--------|
| Command  | `accounts:lookup.accounts:lookup.create` |
| Input    | `{ body: { idToken: "<token>" } }` |
| Error    | Tool not found in tooling.json |
| Expected | Method should be available after installing `firebase.auth` |
| Notes    | Required method was missing after integration install. Fixed by manually running `swytchcode add accounts:lookup.accounts:lookup.create`. **This causes runtime failure and should be handled at install time (auto-register or warn).** |

---

### BUG-002 — Firebase API key not auto-injected (403 error)

| Field    | Detail |
|----------|--------|
| Command  | `accounts:lookup.accounts:lookup.create` |
| Input    | `{ body: { idToken: "..." } }` |
| Error    | `403 Forbidden` from Firebase |
| Expected | Request should include `?key=FIREBASE_API_KEY` automatically |
| Notes    | Firebase Identity Toolkit requires API key in every request. Fixed by manually adding `params: { key: process.env.FIREBASE_API_KEY }`. **This should be automatically handled by SwytchCode for Firebase integrations.** |

---

### BUG-003 — tooling.json resolution depends on exact working directory

| Field    | Detail |
|----------|--------|
| Command  | `accounts:lookup.accounts:lookup.create` |
| Input    | n/a |
| Error    | `tooling.json not found` when running from subdirectory (e.g., /server) |
| Expected | CLI should locate tooling.json automatically |
| Notes    | SwytchCode only checks current working directory. Fixed by manually setting cwd. **CLI should search parent directories (like Git) to support real-world project structures.** |

---