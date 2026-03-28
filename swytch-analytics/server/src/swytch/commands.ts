import exec from "./client";
import { execSync } from "child_process";

// ─── Firebase Auth via SwytchCode ────────────────────────────
export async function verifyFirebaseToken(idToken: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const result = await exec("accounts:lookup.accounts:lookup.create", {
            params: {
                key: process.env.FIREBASE_API_KEY,
            },
            body: { idToken },
        });
        return result;
    } finally {
        clearTimeout(timeout);
    }
}

// ─── Resend Email via SwytchCode ─────────────────────────────
export async function sendEmail({
    to,
    subject,
    html,
    from,
}: {
    to: string;
    subject: string;
    html: string;
    from?: string;
}) {
    const result = await exec("emails.email.create", {
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: {
            from: from || process.env.REPORT_FROM_EMAIL || "onboarding@resend.dev",
            to,
            subject,
            html,
        },
    });
    return result;
}

// ─── Stripe: Create Customer ─────────────────────────────────
// Uses stdin execSync for reliable Windows compatibility
export async function createStripeCustomer({
    email,
    name,
    userId,
}: {
    email: string;
    name: string;
    userId: number;
}) {
    const payload = {
        tool: "customers.customer.create",
        args: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            params: {
                email,
                name,
                "metadata[user_id]": String(userId),
            },
        },
    };

    const cliPath = process.env.SWYTCH_CLI_PATH!;
    const stdout = execSync(
        `"${cliPath}" exec --json`,
        {
            cwd: process.env.PROJECT_ROOT,
            input: JSON.stringify(payload),
        }
    ).toString();

    const result = JSON.parse(stdout);
    return result?.data ?? result;
}

// ─── Stripe: Create Checkout Session ────────────────────────
// line_items must be form-encoded as line_items[0][price] etc.
// Stripe does NOT accept JSON arrays for this endpoint
export async function createCheckoutSession({
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    userId,
}: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    userId: number;
}) {
    const payload = {
        tool: "checkout.session.create",
        args: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            params: {
                mode: "subscription",
                customer: customerId,
                "line_items[0][price]":    priceId,
                "line_items[0][quantity]": "1",
                success_url:               successUrl,
                cancel_url:                cancelUrl,
                "metadata[user_id]":       String(userId),
            },
        },
    };

    const cliPath = process.env.SWYTCH_CLI_PATH!;
    const stdout = execSync(
        `"${cliPath}" exec --json`,
        {
            cwd: process.env.PROJECT_ROOT,
            input: JSON.stringify(payload)
        }
    ).toString();

    const result = JSON.parse(stdout);
    return result?.data ?? result;
}

// ─── Stripe: Get Subscription ────────────────────────────────
export async function getStripeSubscription(subscriptionId: string) {
    const result = await exec("subscriptions.subscription.get", {
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
        params: { subscription_exposed_id: subscriptionId },
    }) as any;

    return result?.data ?? result;
}

// ─── Stripe: Cancel Subscription ────────────────────────────
export async function cancelStripeSubscription(subscriptionId: string) {
    const result = await exec("subscriptions.subscription.delete", {
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
        params: { subscription_exposed_id: subscriptionId },
    }) as any;

    return result?.data ?? result;
}

// ─── Stripe: Get Invoice ─────────────────────────────────────
export async function getStripeInvoice(invoiceId: string) {
    const result = await exec("invoices.invoice.get", {
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
        params: { invoice: invoiceId },
    }) as any;

    return result?.data ?? result;
}

// ─── Stripe: List Invoices ───────────────────────────────────
export async function listStripeInvoices(customerId: string) {
    const result = await exec("invoices.invoice.list", {
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        },
        params: { customer: customerId, limit: 10 },
    }) as any;

    return result?.data ?? result;
}