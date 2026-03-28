import cron from "node-cron";
import { getPool } from "../plugins/mysql";
import { sendAnalyticsReport } from "./email";

export function startEmailReportsCron() {
    // Every Monday at 8am
    cron.schedule("0 8 * * 1", async () => {
        console.log("[cron] Running weekly email reports...");
        await sendReports("weekly");
    });

    // Every 1st of month at 8am
    cron.schedule("0 8 1 * *", async () => {
        console.log("[cron] Running monthly email reports...");
        await sendReports("monthly");
    });

    console.log("[cron] Email report cron jobs started");
}

async function sendReports(frequency: "weekly" | "monthly") {
    const pool = getPool();

    // Only fetch users who are due — never spam
    const intervalClause =
        frequency === "weekly"
            ? "last_sent_at < NOW() - INTERVAL 7 DAY"
            : "last_sent_at < NOW() - INTERVAL 1 MONTH";

    const [users] = await pool.execute(`
        SELECT u.id, u.email, u.display_name
        FROM users u
        JOIN email_reports er ON er.user_id = u.id
        WHERE er.enabled = TRUE
          AND er.frequency = ?
          AND (er.last_sent_at IS NULL OR ${intervalClause})
    `, [frequency]) as any;

    console.log(`[cron] ${frequency} reports: ${users.length} users to notify`);

    for (const user of users) {
        try {
            await sendAnalyticsReport({
                to: user.email,
                userName: user.display_name || "there",
                reportData: {
                    totalUsers: 0,
                    totalSessions: 0,
                    totalPageViews: 0,
                    topPages: [],
                },
            });

            await pool.execute(
                `UPDATE email_reports SET last_sent_at = NOW() WHERE user_id = ?`,
                [user.id]
            );

            console.log(`[cron] Report sent to ${user.email}`);
        } catch (err) {
            // Log failure but continue — one user failing must not stop the batch
            console.error(`[cron] Failed to send report to ${user.email}:`, err);
        }
    }
}