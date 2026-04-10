import { FastifyInstance } from "fastify";
import { sendFreeReport, sendProReport } from "../services/email";

export default async function testEmailRoutes(server: FastifyInstance) {
    // Ensure this route is disabled in production
    if (process.env.NODE_ENV === 'production') {
        return;
    }

    // Test free template
    // GET http://localhost:4000/api/test-email/free?to=your@email.com
    server.get("/test-email/free", async (request, reply) => {
        const { to } = request.query as { to: string };
        if (!to) return reply.status(400).send({ error: "to query param required" });

        await sendFreeReport({
            to,
            userName: "Lakshay",
            frequency: "weekly",
            propertyName: "My Test Site (G-XXXXXXX)",
            reportData: {
                totalUsers: 1284,
                totalSessions: 3421,
                totalPageViews: 8930,
                topPages: [
                    { page: "/home",        views: 3200 },
                    { page: "/dashboard",   views: 1800 },
                    { page: "/login",       views: 950  },
                    { page: "/settings",    views: 620  },
                    { page: "/billing",     views: 360  },
                ],
            },
        });

        return { success: true, template: "free", sentTo: to };
    });

    // Test pro template
    // GET http://localhost:4000/api/test-email/pro?to=your@email.com
    server.get("/test-email/pro", async (request, reply) => {
        const { to } = request.query as { to: string };
        if (!to) return reply.status(400).send({ error: "to query param required" });

        await sendProReport({
            to,
            userName: "Lakshay",
            frequency: "weekly",
            propertyName: "My Test Site (G-XXXXXXX)",
            reportData: {
                totalUsers: 1284,
                totalSessions: 3421,
                totalPageViews: 8930,
                newUsers: 342,
                bounceRate: "38.4%",
                avgSessionDuration: "2m 47s",
                weekOverWeekChange: 18,
                topPages: [
                    { page: "/home",        views: 3200 },
                    { page: "/dashboard",   views: 1800 },
                    { page: "/login",       views: 950  },
                    { page: "/settings",    views: 620  },
                    { page: "/billing",     views: 360  },
                ],
                topSources: [
                    { source: "Google Search", percentage: 48 },
                    { source: "Direct",        percentage: 22 },
                    { source: "Instagram",     percentage: 15 },
                    { source: "Referral",      percentage: 10 },
                ],
                deviceBreakdown: [
                    { device: "Mobile",  percentage: 62 },
                    { device: "Desktop", percentage: 32 },
                    { device: "Tablet",  percentage: 6  },
                ],
                topCity: "New Delhi",
                peakHour: "8 PM",
                insights: [
                    "Traffic increased 18% compared to last week — your best week this month.",
                    "Google Search drives 48% of your visitors. Consider investing more in SEO.",
                    "62% of users are on mobile. Make sure your site is fully mobile-optimised.",
                    "Peak traffic is at 8 PM. Schedule social posts and campaigns around this time.",
                    "Bounce rate is 38.4% — below the 50% industry average. Great engagement.",
                ],
            },
        });

        return { success: true, template: "pro", sentTo: to };
    });
}
