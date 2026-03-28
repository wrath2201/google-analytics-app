# SwytchAnalytics — Stripe Billing Integration Report
**Prepared for:** Manager Review  
**Date:** 26 March 2026  
**Engineer:** Lakshay  
**Project:** SwytchAnalytics — Google Analytics SaaS Dashboard

---

## 1. Executive Summary

This report documents the complete integration of **Stripe billing** into the SwytchAnalytics platform using the **SwytchCode CLI** as a managed API execution layer. The work included migrating pricing from INR to USD, building a full subscription lifecycle (upgrade, webhook processing, cancellation, invoicing), and hardening the integration for production use.

---

## 2. Scope of Work

### 2.1 Frontend Changes
| File | Change |
|------|--------|
| [src/app/billing/page.tsx](file:///c:/Users/Lakshay/OneDrive/Desktop/Google%20analytics%20dashboard/swytch-analytics/src/app/billing/page.tsx) | Rewrote billing page — USD pricing, dynamic subscription state, invoice table, download links |

### 2.2 Backend — New Files
| File | Purpose |
|------|---------|
| [server/src/routes/stripe.ts](file:///c:/Users/Lakshay/OneDrive/Desktop/Google%20analytics%20dashboard/swytch-analytics/server/src/routes/stripe.ts) | 4 REST API endpoints for checkout, webhooks, cancel, invoices |
| [server/src/services/stripe.ts](file:///c:/Users/Lakshay/OneDrive/Desktop/Google%20analytics%20dashboard/swytch-analytics/server/src/services/stripe.ts) | Business logic — customer creation, checkout sessions, plan upgrades/downgrades |
| [server/src/swytch/commands.ts](file:///c:/Users/Lakshay/OneDrive/Desktop/Google%20analytics%20dashboard/swytch-analytics/server/src/swytch/commands.ts) | SwytchCode CLI wrapper functions for all 6 Stripe operations |

### 2.3 Configuration
| File | Change |
|------|--------|
| [.swytchcode/tooling.json](file:///c:/Users/Lakshay/OneDrive/Desktop/Google%20analytics%20dashboard/swytch-analytics/.swytchcode/tooling.json) | Registered 6 Stripe SDK tools manually |
| [server/.env](file:///c:/Users/Lakshay/OneDrive/Desktop/Google%20analytics%20dashboard/swytch-analytics/server/.env) | Added `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` |
| [server/src/index.ts](file:///c:/Users/Lakshay/OneDrive/Desktop/Google%20analytics%20dashboard/swytch-analytics/server/src/index.ts) | Registered Stripe routes under `/api` prefix |

---

## 3. API Endpoints Implemented

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/stripe/checkout` | ✅ JWT | Creates a Stripe hosted checkout session → redirects user to Stripe |
| `POST` | `/api/stripe/webhook` | ❌ (Stripe-signed) | Receives Stripe events, verifies HMAC signature, updates DB |
| `POST` | `/api/stripe/cancel` | ✅ JWT | Cancels the user's active subscription |
| `GET` | `/api/stripe/invoices` | ✅ JWT | Lists last 10 invoices for the current user |
| `GET` | `/api/stripe/invoice/:id` | ✅ JWT | Returns PDF URL + hosted invoice URL for download |

---

## 4. Webhook Security — Production Implementation

Stripe webhooks are secured using **HMAC-SHA256 signature verification** implemented with Node.js's built-in `crypto` module (no external dependencies).

### How It Works
1. Stripe signs every webhook with a `Stripe-Signature` header: `t=<timestamp>,v1=<hmac>`
2. Our server computes: `HMAC-SHA256(STRIPE_WEBHOOK_SECRET, "<timestamp>.<raw_body>")`
3. Uses `crypto.timingSafeEqual()` to compare — preventing timing attacks
4. **Replay attack protection** — rejects events with timestamps > 5 minutes old
5. In production, requests without a valid secret return `400 Bad Request` immediately

### Events Handled
| Stripe Event | Action |
|---|---|
| `invoice.payment_succeeded` | Upgrades user to Pro, stores `stripe_subscription_id` |
| `customer.subscription.deleted` | Downgrades user to Free plan |
| `invoice.payment_failed` | Marks subscription as `past_due` |

---

## 5. SwytchCode CLI Integration — Technical Report

### 5.1 What Is SwytchCode CLI?
SwytchCode is a managed API execution runtime that wraps third-party SDK calls through a local CLI (`swytchcode exec`). Instead of importing the Stripe Node SDK directly, all API calls are routed through the SwytchCode kernel, which handles authentication injection, schema validation, and response normalization.

### 5.2 Tools Registered

```json
{
  "customers.customer.create":       "Creates a Stripe customer",
  "checkout.session.create":         "Creates a hosted checkout session",
  "subscriptions.subscription.get":  "Retrieves subscription details",
  "subscriptions.subscription.delete": "Cancels a subscription",
  "invoices.invoice.get":            "Retrieves a single invoice with PDF URL",
  "invoices.invoice.list":           "Lists invoices for a customer"
}
```

### 5.3 Integration Architecture

```
Frontend (Next.js)
    │  POST /api/stripe/checkout
    ▼
Fastify Backend (Node.js)
    │  services/stripe.ts  ←  Business logic
    ▼
commands.ts  ←  SwytchCode wrapper functions
    │  execSync(swytchcode exec --json, stdin: JSON payload)
    ▼
SwytchCode CLI  ←  Managed API kernel
    │  HTTP POST to api.stripe.com
    ▼
Stripe API
```

---

## 6. SwytchCode CLI — Performance Evaluation

### 6.1 What Worked Well ✅
| Feature | Verdict |
|---------|---------|
| Firebase Auth (`accounts:lookup`) | ✅ Works correctly with `params: { key }` + `body: { idToken }` |
| Resend Email (`emails.email.create`) | ✅ Works correctly with `body: { ... }` for JSON APIs |
| Stripe subscription GET/DELETE | ✅ Works correctly with `params: { id }` |
| Stripe invoice list/get | ✅ Works correctly with query params |
| Local webhook forwarding (`stripe listen`) | ✅ Functioned perfectly |
| Response wrapping | ✅ All responses correctly wrapped in `{ data: { ... } }` |

### 6.2 Issues Discovered & Fixed 🔧

| # | Issue | Root Cause | Fix Applied |
|---|-------|-----------|-------------|
| 1 | All Stripe calls returned `401` | Missing `Authorization: Bearer` header in all 6 wrapper functions | Added `headers: { Authorization: ... }` to every exec call |
| 2 | Response objects had no `id` field | SwytchCode wraps all responses in `{ data: { ... } }` — code was reading the wrapper, not the payload | Added `result?.data ?? result` unwrapping everywhere |
| 3 | `success_url` always "missing" despite being in `body` | For Stripe (form-urlencoded), SwytchCode's `body` field sends a stringified JSON blob, not individual form fields | Switched to `params: { ... }` which is correctly form-encoded |
| 4 | `params` with bracket keys (`line_items[0][price]`) dropped on Windows | CLI argument parsing breaks on `=` and `[` characters in Windows PowerShell | Used `execSync` with **stdin** (`input: JSON.stringify(payload)`) instead of CLI flags |

### 6.3 Key Learnings

> **For form-urlencoded APIs (Stripe):** Always use `params: { ... }`, **not** `body: { ... }`.  
> **For JSON APIs (Resend, Firebase):** Use `body: { ... }` as normal.  
> **For complex payloads on Windows:** Pipe JSON via stdin using `execSync({ input })` — far more reliable than shell arguments.

### 6.4 Final Working Pattern

```typescript
// Reliable cross-platform Stripe call via SwytchCode stdin
const payload = {
    tool: "checkout.session.create",
    args: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        params: {
            mode: "subscription",
            customer: customerId,
            "line_items[0][price]": priceId,
            "line_items[0][quantity]": "1",
            success_url: successUrl,
            cancel_url: cancelUrl,
        },
    },
};

const stdout = execSync(`"${cliPath}" exec --json`, {
    cwd: process.env.PROJECT_ROOT,
    input: JSON.stringify(payload),
}).toString();

return JSON.parse(stdout)?.data;
```

---

## 7. End-to-End Testing Results

| Test | Result |
|------|--------|
| `POST /api/stripe/checkout` returns 401 without auth | ✅ Pass |
| `POST /api/stripe/checkout` returns Stripe URL when authenticated | ✅ Pass |
| `stripe trigger invoice.payment_succeeded` → webhook verified + processed | ✅ Pass |
| Webhook with fake signature rejected with `400` | ✅ Pass |
| Webhook with expired timestamp rejected (replay protection) | ✅ Pass |
| `GET /api/stripe/invoices` returns invoice list | ✅ Pass |
| `GET /api/stripe/invoice/:id` returns `invoice_pdf` URL | ✅ Pass |
| Invoice `invoice_pdf` URL valid and opens Stripe-hosted PDF | ✅ Pass |

---

## 8. Production Readiness Checklist

| Item | Status |
|------|--------|
| Stripe API keys in [.env](file:///c:/Users/Lakshay/OneDrive/Desktop/Google%20analytics%20dashboard/swytch-analytics/server/.env) (not committed to git) | ✅ |
| Webhook signature verification (HMAC-SHA256) | ✅ |
| Replay attack protection (5-min timestamp tolerance) | ✅ |
| Timing-safe signature comparison (`timingSafeEqual`) | ✅ |
| Auth middleware on all user-facing routes | ✅ |
| Webhook route excluded from auth (Stripe calls directly) | ✅ |
| Invoice PDF URL retrieval working | ✅ |
| Error handling and logging on all routes | ✅ |
| `NODE_ENV=production` guard on missing webhook secret | ✅ |
| Test files removed from codebase | ✅ |

---

## 9. Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   Frontend (Next.js)             │
│  billing/page.tsx — USD pricing, plan mgmt,     │
│  invoice table, download links                  │
└──────────────────────┬──────────────────────────┘
                       │ REST API (JWT cookie auth)
┌──────────────────────▼──────────────────────────┐
│             Fastify Backend (port 4000)          │
│                                                 │
│  routes/stripe.ts    →  5 endpoints             │
│  services/stripe.ts  →  Business logic          │
│  swytch/commands.ts  →  CLI wrappers            │
└──────────────────────┬──────────────────────────┘
                       │ execSync (stdin JSON)
┌──────────────────────▼──────────────────────────┐
│            SwytchCode CLI Runtime                │
│  Manages auth, schema validation, HTTP          │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────┐
│              Stripe API (test mode)              │
│  Customers · Checkout · Subscriptions ·         │
│  Invoices · Webhooks                            │
└─────────────────────────────────────────────────┘
```

---

*Report generated: 26 March 2026*
