// ============================================================
// STRIPE SERVICE
// Handles all Stripe operations via SwytchCode CLI
// ============================================================

import { getPool } from "../plugins/mysql";
import {
    createStripeCustomer,
    createCheckoutSession,
    getStripeSubscription,
    cancelStripeSubscription,
    getStripeInvoice,
    listStripeInvoices,
} from "../swytch/commands";

// ── Get or create Stripe customer for a user ─────────────────
export async function getOrCreateStripeCustomer(
    userId: number,
    email: string,
    name: string
): Promise<string> {
    const pool = getPool();

    const [rows] = await pool.execute(
        `SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?`,
        [userId]
    ) as any;

    const existing = rows[0]?.stripe_customer_id;
    if (existing) return existing;

    const customer = await createStripeCustomer({ email, name, userId }) as any;

    if (!customer?.id) {
        throw new Error(`Failed to create Stripe customer. Response: ${JSON.stringify(customer)}`);
    }

    await pool.execute(
        `UPDATE subscriptions SET stripe_customer_id = ? WHERE user_id = ?`,
        [customer.id, userId]
    );

    return customer.id;
}

// ── Create checkout session for Pro plan upgrade ─────────────
export async function createProCheckoutSession(
    userId: number,
    email: string,
    name: string
): Promise<{ url: string }> {
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!priceId) throw new Error("STRIPE_PRO_PRICE_ID not set in environment");

    const customerId = await getOrCreateStripeCustomer(userId, email, name);

    const session = await createCheckoutSession({
        customerId,
        priceId,
        successUrl: `${frontendUrl}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl:  `${frontendUrl}/billing?upgrade=cancelled`,
        userId,
    }) as any;

    if (!session?.url) {
        throw new Error(`Failed to create checkout session. Response: ${JSON.stringify(session)}`);
    }

    return { url: session.url };
}

// ── Verify session locally (Bypass webhook for localhost) ───
export async function verifyCheckoutSession(sessionId: string): Promise<void> {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    });
    if (!res.ok) throw new Error("Failed to verify session with Stripe");
    
    const session = await res.json() as any;
    if (session.payment_status === "paid" && session.customer && session.subscription) {
        await handleProUpgrade(session.customer, session.subscription, "");
    }
}

// ── Handle successful payment — upgrade user to Pro ──────────
export async function handleProUpgrade(
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    invoiceId: string
): Promise<void> {
    const pool = getPool();

    await pool.execute(
        `UPDATE subscriptions
         SET plan                   = 'pro',
             status                 = 'active',
             apps_allowed           = 999,
             stripe_subscription_id = ?
         WHERE stripe_customer_id = ?`,
        [stripeSubscriptionId, stripeCustomerId]
    );
}

// ── Handle cancellation — downgrade user to Free ─────────────
export async function handleProCancellation(
    stripeCustomerId: string
): Promise<void> {
    const pool = getPool();

    await pool.execute(
        `UPDATE subscriptions
         SET plan         = 'free',
             status       = 'cancelled',
             apps_allowed = 1
         WHERE stripe_customer_id = ?`,
        [stripeCustomerId]
    );
}

// ── Cancel subscription for a user ───────────────────────────
export async function cancelUserSubscription(userId: number): Promise<void> {
    const pool = getPool();

    const [rows] = await pool.execute(
        `SELECT stripe_customer_id, stripe_subscription_id
         FROM subscriptions WHERE user_id = ?`,
        [userId]
    ) as any;

    const { stripe_customer_id, stripe_subscription_id } = rows[0] ?? {};

    if (!stripe_subscription_id) throw new Error("No active subscription found");

    await cancelStripeSubscription(stripe_subscription_id);
    await handleProCancellation(stripe_customer_id);
}

// ── Get invoice PDF URL ───────────────────────────────────────
export async function getInvoicePdfUrl(
    invoiceId: string
): Promise<{ pdf: string; url: string }> {
    const invoice = await getStripeInvoice(invoiceId) as any;

    if (!invoice?.id) throw new Error("Invoice not found");

    return {
        pdf: invoice.invoice_pdf,
        url: invoice.hosted_invoice_url,
    };
}

// ── List invoices for a user ──────────────────────────────────
export async function getUserInvoices(userId: number): Promise<any[]> {
    const pool = getPool();

    const [rows] = await pool.execute(
        `SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?`,
        [userId]
    ) as any;

    const customerId = rows[0]?.stripe_customer_id;
    if (!customerId) return [];

    const result = await listStripeInvoices(customerId) as any;
    return result?.data ?? [];
}
