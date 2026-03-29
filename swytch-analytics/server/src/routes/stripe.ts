// ============================================================
// STRIPE ROUTES
// POST   /api/stripe/checkout     → create checkout session
// POST   /api/stripe/webhook      → handle Stripe events
// POST   /api/stripe/cancel       → cancel subscription
// GET    /api/stripe/invoices     → list user invoices
// GET    /api/stripe/invoice/:id  → get invoice PDF url
// ============================================================

import { FastifyInstance } from "fastify";
import { authenticate } from "../plugins/authenticate";
import {
    createProCheckoutSession,
    handleProUpgrade,
    handleProCancellation,
    cancelUserSubscription,
    getUserInvoices,
    getInvoicePdfUrl,
} from "../services/stripe";

export default async function stripeRoutes(server: FastifyInstance) {

    // ── Raw body content type parser (webhook signature verification) ──
    // Stripe sends applications/json but signs the raw bytes — we must capture
    // both the raw buffer and the parsed JSON object.
    server.addContentTypeParser(
        "application/json",
        { parseAs: "buffer" },
        (req, body: Buffer, done) => {
            try {
                (req as any).rawBody = body.toString("utf8");
                const parsed = JSON.parse((req as any).rawBody);
                done(null, parsed);
            } catch (err: any) {
                done(err, undefined);
            }
        }
    );

    // ── POST /api/stripe/checkout ────────────────────────────
    // Creates a Stripe hosted checkout session for Pro upgrade
    server.post("/stripe/checkout", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user as any;

            const { email, name } = request.body as {
                email: string;
                name: string;
            };

            if (!email) {
                return reply.status(400).send({ error: "email is required" });
            }

            const { url } = await createProCheckoutSession(
                user.db_id,
                email,
                name || email
            );

            return { url };

        } catch (err: any) {
            console.error("STRIPE CRASH FULL LOG:", err);
            server.log.error({ err }, "[stripe] checkout failed");
            return reply.status(500).send({ error: "Failed to create checkout session", details: err.message });
        }
    });

    // ── POST /api/stripe/verify-session ──────────────────────
    server.post("/stripe/verify-session", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const { sessionId } = request.body as { sessionId: string };
            if (!sessionId) return reply.status(400).send({ error: "session_id required" });

            const { verifyCheckoutSession } = require("../services/stripe");
            await verifyCheckoutSession(sessionId);
            return { success: true };
        } catch (err: any) {
            server.log.error({ err }, "[stripe] manual verification failed");
            return reply.status(500).send({ error: "Verification failed" });
        }
    });

    // ── POST /api/stripe/webhook ─────────────────────────────
    // Stripe sends events here after payment/cancellation
    // Must NOT use authenticate hook — Stripe calls this directly
    server.post("/stripe/webhook", {
        config: { rawBody: true }
    }, async (request, reply) => {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const signature = request.headers["stripe-signature"] as string;

        // ── Webhook signature verification (HMAC-SHA256) ─────
        if (webhookSecret && signature) {
            try {
                const crypto = await import("crypto");

                // Stripe signature header format:
                // t=<timestamp>,v1=<hmac>,v0=<hmac>
                const parts = Object.fromEntries(
                    signature.split(",").map(s => s.split("=") as [string, string])
                );
                const timestamp = parts["t"];
                const expectedSig = parts["v1"];

                if (!timestamp || !expectedSig) {
                    server.log.warn("[stripe] malformed stripe-signature header");
                    return reply.status(400).send({ error: "Invalid signature" });
                }

                // Reject requests older than 5 minutes (replay attack protection)
                const tolerance = 5 * 60; // seconds
                const now = Math.floor(Date.now() / 1000);
                if (Math.abs(now - parseInt(timestamp)) > tolerance) {
                    server.log.warn("[stripe] webhook timestamp too old");
                    return reply.status(400).send({ error: "Timestamp too old" });
                }

                // Compute expected HMAC: HMAC-SHA256(secret, "<timestamp>.<raw_body>")
                const rawBody = (request as any).rawBody ?? JSON.stringify(request.body);
                const signedPayload = `${timestamp}.${rawBody}`;
                const computedSig = crypto
                    .createHmac("sha256", webhookSecret)
                    .update(signedPayload, "utf8")
                    .digest("hex");

                const isValid = crypto.timingSafeEqual(
                    Buffer.from(computedSig, "hex"),
                    Buffer.from(expectedSig, "hex")
                );

                if (!isValid) {
                    server.log.warn("[stripe] webhook signature mismatch — request rejected");
                    return reply.status(400).send({ error: "Invalid signature" });
                }

                server.log.info("[stripe] webhook signature verified ✓");

            } catch (err: any) {
                server.log.error({ err }, "[stripe] signature verification error");
                return reply.status(400).send({ error: "Signature verification failed" });
            }
        } else if (process.env.NODE_ENV === "production") {
            // In production, STRIPE_WEBHOOK_SECRET must be set
            server.log.error("[stripe] STRIPE_WEBHOOK_SECRET not configured in production");
            return reply.status(500).send({ error: "Webhook not configured" });
        } else {
            server.log.warn("[stripe] signature verification skipped (dev mode, no secret set)");
        }

        try {
            const payload = request.body as any;

            server.log.info({ type: payload?.type }, "[stripe] webhook received");

            switch (payload?.type) {

                // ── Payment succeeded → upgrade to Pro ───────
                case "invoice.payment_succeeded": {
                    const invoice = payload.data?.object;
                    const customerId = invoice?.customer;
                    const subscriptionId = invoice?.subscription;
                    const invoiceId = invoice?.id;

                    if (customerId && subscriptionId) {
                        await handleProUpgrade(customerId, subscriptionId, invoiceId);
                        server.log.info({ customerId }, "[stripe] user upgraded to Pro");
                    }
                    break;
                }

                // ── Subscription cancelled → downgrade to Free
                case "customer.subscription.deleted": {
                    const subscription = payload.data?.object;
                    const customerId = subscription?.customer;

                    if (customerId) {
                        await handleProCancellation(customerId);
                        server.log.info({ customerId }, "[stripe] user downgraded to Free");
                    }
                    break;
                }

                // ── Payment failed → mark as past_due ────────
                case "invoice.payment_failed": {
                    const invoice = payload.data?.object;
                    const customerId = invoice?.customer;

                    if (customerId) {
                        const pool = (await import("../plugins/mysql")).getPool();
                        await pool.execute(
                            `UPDATE subscriptions SET status = 'past_due' WHERE stripe_customer_id = ?`,
                            [customerId]
                        );
                        server.log.warn({ customerId }, "[stripe] payment failed — marked past_due");
                    }
                    break;
                }

                default:
                    server.log.info({ type: payload?.type }, "[stripe] unhandled event");
            }

            return { received: true };

        } catch (err: any) {
            server.log.error({ err }, "[stripe] webhook processing failed");
            return reply.status(500).send({ error: "Webhook processing failed" });
        }
    });

    // ── POST /api/stripe/cancel ──────────────────────────────
    server.post("/stripe/cancel", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user as any;
            await cancelUserSubscription(user.db_id);
            return { success: true };
        } catch (err: any) {
            server.log.error({ err }, "[stripe] cancel failed");
            return reply.status(500).send({ error: "Failed to cancel subscription" });
        }
    });

    // ── GET /api/stripe/invoices ─────────────────────────────
    server.get("/stripe/invoices", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user as any;
            const invoices = await getUserInvoices(user.db_id);
            return { invoices };
        } catch (err: any) {
            server.log.error({ err }, "[stripe] list invoices failed");
            return reply.status(500).send({ error: "Failed to fetch invoices" });
        }
    });

    // ── GET /api/stripe/invoice/:id ──────────────────────────
    server.get("/stripe/invoice/:id", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const { pdf, url } = await getInvoicePdfUrl(id);
            return { pdf, url };
        } catch (err: any) {
            server.log.error({ err }, "[stripe] get invoice failed");
            return reply.status(500).send({ error: "Failed to fetch invoice" });
        }
    });
}
