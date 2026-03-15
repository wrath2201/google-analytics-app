import cron from "node-cron";
import { getPool } from "../plugins/mysql";
import { sendAnalyticsReport } from "./email";

export function startEmailReportsCron() {
    // Every Monday at 8am
    cron.schedule("0 8 * * 1", async () => {
        console.log("Running weekly email reports...");
        await sendWeeklyReports();
    });

    // Every 1st of month at 8am
    cron.schedule("0 8 1 * *", async () => {
        console.log("Running monthly email reports...");
        await sendMonthlyReports();
    });

    console.log("Email report cron jobs started");
}

async function sendWeeklyReports() {
    const pool = getPool();

    const [users] = await pool.execute(`
        SELECT u.id, u.email, u.display_name
        FROM users u
        JOIN email_reports er ON er.user_id = u.id
        WHERE er.enabled = TRUE AND er.frequency = 'weekly'
    `) as any;

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

            console.log(`Report sent to ${user.email}`);
        } catch (err) {
            console.error(`Failed to send report to ${user.email}:`, err);
        }
    }
}

async function sendMonthlyReports() {
    const pool = getPool();

    const [users] = await pool.execute(`
        SELECT u.id, u.email, u.display_name
        FROM users u
        JOIN email_reports er ON er.user_id = u.id
        WHERE er.enabled = TRUE AND er.frequency = 'monthly'
    `) as any;

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
        } catch (err) {
            console.error(`Failed to send report to ${user.email}:`, err);
        }
    }
}