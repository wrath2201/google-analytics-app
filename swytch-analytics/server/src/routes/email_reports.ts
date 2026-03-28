// ============================================================
// EMAIL REPORTS ROUTES
// GET    /api/email-reports     → get current user's report settings
// PUT    /api/email-reports     → update frequency + enabled
// ============================================================

import { FastifyInstance } from "fastify";
import { getPool } from "../plugins/mysql";
import { authenticate } from "../plugins/authenticate";

export default async function emailReportsRoutes(server: FastifyInstance) {

    // ── GET /api/email-reports ───────────────────────────────
    server.get("/email-reports", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user as any;
            const pool = getPool();

            const [rows] = await pool.execute(
                `SELECT id, frequency, enabled, last_sent_at
                 FROM email_reports
                 WHERE user_id = ?`,
                [user.db_id]
            ) as any;

            // No row yet — return defaults
            if (!rows.length) {
                return {
                    enabled: false,
                    frequency: "weekly",
                    last_sent_at: null,
                };
            }

            return {
                enabled: Boolean(rows[0].enabled),
                frequency: rows[0].frequency,
                last_sent_at: rows[0].last_sent_at,
            };

        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch email report settings" });
        }
    });

    // ── PUT /api/email-reports ───────────────────────────────
    server.put("/email-reports", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user as any;
            const pool = getPool();

            const { enabled, frequency } = request.body as {
                enabled: boolean;
                frequency: "weekly" | "monthly";
            };

            // Validate frequency value
            if (frequency && !["weekly", "monthly"].includes(frequency)) {
                return reply.status(400).send({
                    error: "frequency must be 'weekly' or 'monthly'"
                });
            }

            // Upsert — create if not exists, update if exists
            await pool.execute(
                `INSERT INTO email_reports (user_id, enabled, frequency)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                     enabled   = VALUES(enabled),
                     frequency = VALUES(frequency)`,
                [user.db_id, enabled ?? true, frequency ?? "weekly"]
            );

            return { success: true };

        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to update email report settings" });
        }
    });
}