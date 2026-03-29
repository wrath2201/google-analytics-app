import cron from "node-cron";
import { getPool } from "../plugins/mysql";
import { sendFreeReport, sendProReport, ProReportData } from "./email";

export function startEmailReportsCron() {
    // Weekly — every Monday at 8am
    cron.schedule("0 8 * * 1", async () => {
        console.log("[cron] Running weekly email reports...");
        await sendReports("weekly");
    });

    // Monthly — every 1st of month at 8am
    cron.schedule("0 8 1 * *", async () => {
        console.log("[cron] Running monthly email reports...");
        await sendReports("monthly");
    });

    console.log("[cron] Email report cron jobs started");
}

async function sendReports(frequency: "weekly" | "monthly") {
    const pool = getPool();
    const interval = frequency === "weekly" ? "7 DAY" : "30 DAY";

    // Fetch users due for a report, including their plan
    const [users] = await pool.execute(`
        SELECT
            u.id,
            u.email,
            u.display_name,
            s.plan,
            a.id          AS app_id,
            a.property_id,
            a.name        AS app_name
        FROM users u
        JOIN email_reports er  ON er.user_id  = u.id
        JOIN subscriptions  s  ON s.user_id   = u.id
        JOIN apps           a  ON a.user_id   = u.id
        WHERE
            er.enabled    = TRUE
            AND er.frequency = ?
            AND (
                er.last_sent_at IS NULL
                OR er.last_sent_at < NOW() - INTERVAL ${interval}
            )
    `, [frequency]) as any;

    if (!users.length) {
        console.log(`[cron] No ${frequency} reports to send.`);
        return;
    }

    console.log(`[cron] Sending ${users.length} ${frequency} report(s)...`);

    for (const user of users) {
        try {
            const isPro = user.plan === "pro";
            const propertyName = user.app_name || user.property_id || "Your Property";
            const userName = user.display_name || "there";

            if (isPro) {
                // Build pro report data
                // In production: call your GA routes here to get real data.
                // For now we send with zeroed data — wire up real GA calls when ready.
                const reportData: ProReportData = {
                    totalUsers: 0,
                    totalSessions: 0,
                    totalPageViews: 0,
                    newUsers: 0,
                    bounceRate: "—",
                    avgSessionDuration: "—",
                    topPages: [],
                    topSources: [],
                    deviceBreakdown: [],
                    topCity: "—",
                    peakHour: "—",
                    weekOverWeekChange: 0,
                    insights: [
                        "Connect real GA data to generate AI-powered insights.",
                    ],
                };

                await sendProReport({
                    to: user.email,
                    userName,
                    frequency,
                    propertyName,
                    reportData,
                });

            } else {
                // Free plan — basic template
                await sendFreeReport({
                    to: user.email,
                    userName,
                    frequency,
                    propertyName,
                    reportData: {
                        totalUsers: 0,
                        totalSessions: 0,
                        totalPageViews: 0,
                        topPages: [],
                    },
                });
            }

            // Mark as sent
            await pool.execute(
                `UPDATE email_reports SET last_sent_at = NOW() WHERE user_id = ?`,
                [user.id]
            );

            console.log(`[cron] ✓ ${frequency} report sent to ${user.email} (${user.plan} plan)`);

        } catch (err) {
            console.error(`[cron] ✗ Failed to send to ${user.email}:`, err);
        }
    }
}