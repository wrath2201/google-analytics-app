import { sendEmail as swytchSendEmail } from "../swytch/commands";

// ─────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────
export interface BaseReportData {
    totalUsers: number;
    totalSessions: number;
    totalPageViews: number;
    topPages: { page: string; views: number }[];
}

export interface ProReportData extends BaseReportData {
    newUsers: number;
    bounceRate: string;           // e.g. "42.3%"
    avgSessionDuration: string;   // e.g. "2m 14s"
    topSources: { source: string; percentage: number }[];
    deviceBreakdown: { device: string; percentage: number }[];
    topCity: string;
    peakHour: string;             // e.g. "8 PM"
    weekOverWeekChange: number;   // e.g. 12 means +12%, -5 means -5%
    insights: string[];           // auto-generated insight strings
}

// ─────────────────────────────────────────────────────────────
// Shared HTML helpers
// ─────────────────────────────────────────────────────────────
const NAVY = "#1B3A6B";
const WARM = "#C4956A";
const INK = "#1A1814";
const MID = "#8C8578";
const CREAM = "#F7F5F0";
const LINE = "#E5E0D8";
const WHITE = "#FFFFFF";
const GREEN = "#2E7D32";
const RED = "#C62828";

function emailWrapper(content: string, previewText: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>SwytchAnalytics Report</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F0ECE6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Preview text -->
  <span style="display:none;max-height:0;overflow:hidden;color:#F0ECE6;">${previewText}</span>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0ECE6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:${NAVY};border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                          <span style="color:${WHITE};font-size:18px;line-height:36px;">&#9989;</span>
                        </td>
                        <td style="padding-left:10px;vertical-align:middle;">
                          <span style="font-size:17px;font-weight:700;color:${INK};letter-spacing:-0.3px;">SwytchAnalytics</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:${WHITE};border-radius:20px;border:1px solid ${LINE};overflow:hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#B0A898;line-height:1.6;">
                You're receiving this because you enabled reports on SwytchAnalytics.<br/>
                <a href="#" style="color:${MID};text-decoration:underline;">Manage preferences</a>
                &nbsp;·&nbsp;
                <a href="#" style="color:${MID};text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function metricCard(value: string, label: string, subtext = ""): string {
    return `
    <td width="33%" style="text-align:center;padding:20px 12px;background:${CREAM};border-radius:12px;">
      <p style="margin:0;font-size:26px;font-weight:700;color:${NAVY};letter-spacing:-0.5px;">${value}</p>
      <p style="margin:4px 0 0;font-size:11px;color:${MID};text-transform:uppercase;letter-spacing:0.08em;">${label}</p>
      ${subtext ? `<p style="margin:3px 0 0;font-size:11px;color:${WARM};">${subtext}</p>` : ""}
    </td>`;
}

function divider(): string {
    return `<tr><td style="padding:0 32px;"><div style="height:1px;background:${LINE};"></div></td></tr>`;
}

// ─────────────────────────────────────────────────────────────
// FREE TEMPLATE
// ─────────────────────────────────────────────────────────────
export async function sendFreeReport({
    to,
    userName,
    frequency,
    propertyName,
    reportData,
}: {
    to: string;
    userName: string;
    frequency: "weekly" | "monthly";
    propertyName: string;
    reportData: BaseReportData;
}) {
    const period = frequency === "weekly" ? "This Week" : "This Month";
    const label = frequency === "weekly" ? "Weekly" : "Monthly";

    const topPagesRows = reportData.topPages.slice(0, 5).map((p, i) => `
        <tr>
          <td style="padding:11px 0;border-bottom:1px solid ${LINE};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:13px;color:${INK};">
                  <span style="color:${MID};margin-right:8px;">${i + 1}.</span>${p.page}
                </td>
                <td align="right" style="font-size:13px;font-weight:600;color:${NAVY};white-space:nowrap;">
                  ${p.views.toLocaleString()} views
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join("");

    const content = `
      <!-- Top bar -->
      <div style="background:${NAVY};padding:28px 32px 24px;">
        <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.1em;">${label} Report · ${propertyName}</p>
        <h1 style="margin:0;font-size:26px;font-weight:700;color:${WHITE};letter-spacing:-0.5px;">Your Analytics ${period}</h1>
        <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">Hi ${userName}, here's how your site performed.</p>
      </div>

      <!-- Metrics -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:28px 24px 24px;">
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr style="gap:12px;">
                ${metricCard(reportData.totalUsers.toLocaleString(), "Users")}
                <td width="2%" style="background:transparent;"></td>
                ${metricCard(reportData.totalSessions.toLocaleString(), "Sessions")}
                <td width="2%" style="background:transparent;"></td>
                ${metricCard(reportData.totalPageViews.toLocaleString(), "Page Views")}
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Top Pages -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 32px 28px;">
        <tr>
          <td>
            <p style="margin:0 0 14px;font-size:14px;font-weight:600;color:${INK};">Top Pages</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${topPagesRows || `<tr><td style="font-size:13px;color:${MID};padding:12px 0;">No page data available yet.</td></tr>`}
            </table>
          </td>
        </tr>
      </table>

      <!-- Upgrade nudge -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 32px 32px;">
        <tr>
          <td style="background:${CREAM};border:1px solid ${LINE};border-radius:12px;padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${INK};">Want deeper insights?</p>
            <p style="margin:0 0 14px;font-size:12px;color:${MID};line-height:1.5;">
              Upgrade to Pro to unlock bounce rate, traffic sources, device breakdown, location data, peak hours, and AI-generated insights in every report.
            </p>
            <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/billing"
               style="display:inline-block;background:${NAVY};color:${WHITE};font-size:12px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
              Upgrade to Pro →
            </a>
          </td>
        </tr>
      </table>`;

    const html = emailWrapper(content, `Your ${label} analytics: ${reportData.totalUsers.toLocaleString()} users, ${reportData.totalSessions.toLocaleString()} sessions.`);

    return swytchSendEmail({
        to,
        subject: `Your ${label} Analytics Report — SwytchAnalytics`,
        html,
    });
}

// ─────────────────────────────────────────────────────────────
// PRO TEMPLATE
// ─────────────────────────────────────────────────────────────
export async function sendProReport({
    to,
    userName,
    frequency,
    propertyName,
    reportData,
}: {
    to: string;
    userName: string;
    frequency: "weekly" | "monthly";
    propertyName: string;
    reportData: ProReportData;
}) {
    const period = frequency === "weekly" ? "This Week" : "This Month";
    const label = frequency === "weekly" ? "Weekly" : "Monthly";

    const changeColor = reportData.weekOverWeekChange >= 0 ? GREEN : RED;
    const changeSign = reportData.weekOverWeekChange >= 0 ? "+" : "";
    const changeArrow = reportData.weekOverWeekChange >= 0 ? "▲" : "▼";

    const topPagesRows = reportData.topPages.slice(0, 5).map((p, i) => {
        const maxViews = reportData.topPages[0]?.views || 1;
        const pct = Math.round((p.views / maxViews) * 100);
        return `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${LINE};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="4%" style="font-size:11px;color:${MID};font-weight:600;vertical-align:middle;">${i + 1}</td>
                <td style="vertical-align:middle;">
                  <p style="margin:0 0 4px;font-size:13px;color:${INK};">${p.page}</p>
                  <div style="height:4px;background:#E5E0D8;border-radius:2px;overflow:hidden;">
                    <div style="height:4px;width:${pct}%;background:${NAVY};border-radius:2px;"></div>
                  </div>
                </td>
                <td align="right" style="padding-left:12px;font-size:13px;font-weight:600;color:${NAVY};white-space:nowrap;vertical-align:middle;">
                  ${p.views.toLocaleString()}
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    }).join("");

    const sourcesRows = (reportData.topSources || []).slice(0, 4).map(s => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid ${LINE};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:13px;color:${INK};">${s.source}</td>
                <td align="right">
                  <span style="font-size:12px;font-weight:600;color:${NAVY};background:${CREAM};padding:2px 8px;border-radius:20px;">${s.percentage}%</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join("");

    const devicesRows = (reportData.deviceBreakdown || []).map(d => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid ${LINE};">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:13px;color:${INK};">${d.device}</td>
                <td align="right">
                  <span style="font-size:12px;font-weight:600;color:${WARM};background:#FBF4ED;padding:2px 8px;border-radius:20px;">${d.percentage}%</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>`).join("");

    const insightItems = (reportData.insights || []).map(ins => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid ${LINE};">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:20px;vertical-align:top;padding-top:1px;">
                  <span style="font-size:14px;">💡</span>
                </td>
                <td style="padding-left:10px;font-size:13px;color:${INK};line-height:1.5;">${ins}</td>
              </tr>
            </table>
          </td>
        </tr>`).join("");

    const content = `
      <!-- Top bar with Pro badge -->
      <div style="background:linear-gradient(135deg,${NAVY} 0%,#2A5298 100%);padding:28px 32px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.1em;">${label} Report · ${propertyName}</p>
              <h1 style="margin:0;font-size:26px;font-weight:700;color:${WHITE};letter-spacing:-0.5px;">Your Analytics ${period}</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">Hi ${userName} — here's your full breakdown.</p>
            </td>
            <td align="right" valign="top">
              <span style="display:inline-block;background:${WARM};color:${WHITE};font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:0.08em;text-transform:uppercase;">PRO</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- WoW change banner -->
      <div style="background:#EEF2FB;padding:12px 32px;border-bottom:1px solid ${LINE};">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="font-size:13px;color:${INK};">
              Traffic vs last ${frequency === "weekly" ? "week" : "month"}:&nbsp;
              <strong style="color:${changeColor};">${changeArrow} ${changeSign}${reportData.weekOverWeekChange}%</strong>
            </td>
          </tr>
        </table>
      </div>

      <!-- Core metrics row -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:28px 24px 20px;">
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${metricCard(reportData.totalUsers.toLocaleString(), "Users", `+${reportData.newUsers.toLocaleString()} new`)}
                <td width="2%" style="background:transparent;"></td>
                ${metricCard(reportData.totalSessions.toLocaleString(), "Sessions", "")}
                <td width="2%" style="background:transparent;"></td>
                ${metricCard(reportData.totalPageViews.toLocaleString(), "Page Views", "")}
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Secondary metrics row -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 24px 24px;">
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${metricCard(reportData.bounceRate, "Bounce Rate", "")}
                <td width="2%" style="background:transparent;"></td>
                ${metricCard(reportData.avgSessionDuration, "Avg. Session", "")}
                <td width="2%" style="background:transparent;"></td>
                ${metricCard(reportData.peakHour, "Peak Hour", "Most traffic")}
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- AI Insights -->
      ${insightItems ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 32px 24px;">
        <tr>
          <td>
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:${INK};">AI Insights</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#FAFAF7;border:1px solid ${LINE};border-radius:12px;overflow:hidden;">
              ${insightItems}
            </table>
          </td>
        </tr>
      </table>` : ""}

      <!-- Top Pages + Sources side by side -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 32px 24px;">
        <tr valign="top">
          <td width="52%">
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:${INK};">Top Pages</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${topPagesRows || `<tr><td style="font-size:13px;color:${MID};padding:12px 0;">No page data yet.</td></tr>`}
            </table>
          </td>
          <td width="4%"></td>
          <td width="44%">
            <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:${INK};">Traffic Sources</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${sourcesRows || `<tr><td style="font-size:13px;color:${MID};padding:12px 0;">No source data yet.</td></tr>`}
            </table>
            <p style="margin:20px 0 12px;font-size:14px;font-weight:600;color:${INK};">Devices</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${devicesRows || `<tr><td style="font-size:13px;color:${MID};padding:12px 0;">No device data yet.</td></tr>`}
            </table>
          </td>
        </tr>
      </table>

      <!-- Location + CTA -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 32px 32px;">
        <tr>
          <td style="background:${CREAM};border:1px solid ${LINE};border-radius:12px;padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <p style="margin:0 0 2px;font-size:12px;color:${MID};text-transform:uppercase;letter-spacing:0.06em;">Top Location</p>
                  <p style="margin:0;font-size:16px;font-weight:700;color:${NAVY};">${reportData.topCity || "—"}</p>
                </td>
                <td align="right">
                  <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard"
                     style="display:inline-block;background:${NAVY};color:${WHITE};font-size:12px;font-weight:600;padding:10px 20px;border-radius:8px;text-decoration:none;">
                    View Full Dashboard →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;

    const html = emailWrapper(
        content,
        `${changeArrow} ${changeSign}${reportData.weekOverWeekChange}% · ${reportData.totalUsers.toLocaleString()} users · Peak at ${reportData.peakHour}`
    );

    return swytchSendEmail({
        to,
        subject: `[Pro] Your ${label} Analytics Report — SwytchAnalytics`,
        html,
    });
}