import { sendEmail as swytchSendEmail } from "../swytch/commands";

export async function sendAnalyticsReport({
    to,
    userName,
    reportData,
}: {
    to: string;
    userName: string;
    reportData: {
        totalUsers: number;
        totalSessions: number;
        totalPageViews: number;
        topPages: { page: string; views: number }[];
    };
}) {
    const html = `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F4; padding: 40px 20px;">
            <div style="background: white; border-radius: 16px; border: 1px solid #E5E0D8; padding: 40px;">
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
                    <div style="width: 36px; height: 36px; background: #1B3A6B; border-radius: 8px;">
                        <span style="color: white; font-size: 18px;">📊</span>
                    </div>
                    <span style="font-size: 18px; font-weight: 600; color: #1A1814;">SwytchAnalytics</span>
                </div>

                <h1 style="font-size: 24px; color: #1A1814; margin-bottom: 8px;">Weekly Report</h1>
                <p style="color: #8C8578; font-size: 14px; margin-bottom: 32px;">
                    Hi ${userName}, here's your analytics summary for this week.
                </p>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
                    <div style="background: #F7F5F0; border-radius: 12px; padding: 20px; text-align: center;">
                        <p style="font-size: 28px; font-weight: 700; color: #1B3A6B; margin: 0;">${reportData.totalUsers.toLocaleString()}</p>
                        <p style="font-size: 12px; color: #8C8578; margin: 4px 0 0;">Total Users</p>
                    </div>
                    <div style="background: #F7F5F0; border-radius: 12px; padding: 20px; text-align: center;">
                        <p style="font-size: 28px; font-weight: 700; color: #1B3A6B; margin: 0;">${reportData.totalSessions.toLocaleString()}</p>
                        <p style="font-size: 12px; color: #8C8578; margin: 4px 0 0;">Sessions</p>
                    </div>
                    <div style="background: #F7F5F0; border-radius: 12px; padding: 20px; text-align: center;">
                        <p style="font-size: 28px; font-weight: 700; color: #1B3A6B; margin: 0;">${reportData.totalPageViews.toLocaleString()}</p>
                        <p style="font-size: 12px; color: #8C8578; margin: 4px 0 0;">Page Views</p>
                    </div>
                </div>

                <div style="margin-bottom: 32px;">
                    <h2 style="font-size: 16px; font-weight: 600; color: #1A1814; margin-bottom: 16px;">Top Pages</h2>
                    ${reportData.topPages.map((p, i) => `
                        <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #E5E0D8;">
                            <span style="font-size: 13px; color: #1A1814;">${i + 1}. ${p.page}</span>
                            <span style="font-size: 13px; font-weight: 600; color: #1B3A6B;">${p.views.toLocaleString()} views</span>
                        </div>
                    `).join("")}
                </div>

                <div style="border-top: 1px solid #E5E0D8; padding-top: 24px; text-align: center;">
                    <p style="font-size: 12px; color: #8C8578;">
                        You're receiving this because you enabled weekly reports on SwytchAnalytics.
                    </p>
                </div>
            </div>
        </div>
    `;

    const result = await swytchSendEmail({
        to,
        subject: "Your Weekly Analytics Report — SwytchAnalytics",
        html,
    });

    return result;
}