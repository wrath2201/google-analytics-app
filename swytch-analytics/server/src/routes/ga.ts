// ============================================================
// GA ROUTES
// All report routes use SwytchCode runtime (no direct GA calls)
// Properties + streams keep direct calls — Admin API not in tooling.json
// ============================================================

import { FastifyInstance } from "fastify";
import { getPool } from "../plugins/mysql";

async function getCachedAnalytics(propertyId: string) {
    const pool = getPool();
    const cleanId = propertyId.startsWith("properties/") ? propertyId : `properties/${propertyId}`;
    const [rows] = await pool.execute(
        `SELECT * FROM daily_analytics 
         WHERE property_id = ? 
         AND record_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
         AND record_date < CURDATE()
         ORDER BY record_date ASC`,
        [cleanId]
    ) as any[];
    return rows;
}

function aggregateJSONBreakdown(rows: any[], keyName: string, sortByValue: boolean = true) {
    const aggregated: Record<string, number> = {};
    for (const row of rows) {
        if (!row[keyName]) continue;
        const data = typeof row[keyName] === 'string' ? JSON.parse(row[keyName]) : row[keyName];
        if (data && data.labels && data.values) {
            for (let i = 0; i < data.labels.length; i++) {
                const label = data.labels[i];
                aggregated[label] = (aggregated[label] || 0) + Number(data.values[i]);
            }
        }
    }
    const sortedLabels = Object.keys(aggregated).sort((a, b) => {
        if (sortByValue) return aggregated[b] - aggregated[a];
        return a.localeCompare(b);
    });
    const sortedValues = sortedLabels.map(l => aggregated[l]);
    return { labels: sortedLabels, values: sortedValues };
}

export default async function gaRoutes(server: FastifyInstance) {

    server.get("/ga/properties", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const accessToken = request.cookies.google_access_token;
            if (!accessToken) return reply.status(401).send({ error: "Google access token missing" });

            const res = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    reply.clearCookie("google_access_token", { path: "/" });
                    return reply.status(401).send({ error: "Google token expired or invalid" });
                }
                const err = await res.text();
                request.log.error("Google API Error: " + err);
                return reply.status(res.status).send({ error: "Failed to fetch from Google", details: err });
            }

            const data = await res.json() as any;

            const properties = data.accountSummaries?.flatMap((account: any) =>
                (account.propertySummaries || []).map((prop: any) => ({
                    propertyId: prop.property,
                    displayName: prop.displayName,
                    account: account.account
                }))
            ) || [];

            const accounts = data.accountSummaries?.map((account: any) => ({
                id: account.account,
                displayName: account.displayName
            })) || [];

            return { properties, accounts };
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch GA properties" });
        }
    });

    server.post("/ga/properties/create", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const accessToken = request.cookies.google_access_token;
            if (!accessToken) return reply.status(401).send({ error: "Google access token missing" });

            const { parent, displayName, timeZone, websiteUrl } = request.body as {
                parent: string; displayName: string; timeZone: string; websiteUrl: string;
            };

            if (!parent || !displayName || !timeZone) {
                return reply.status(400).send({ error: "Missing required fields for property creation" });
            }

            const propRes = await fetch("https://analyticsadmin.googleapis.com/v1beta/properties", {
                method: "POST",
                headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                body: JSON.stringify({ parent, displayName, timeZone })
            });

            if (!propRes.ok) {
                if (propRes.status === 401 || propRes.status === 403) {
                    reply.clearCookie("google_access_token", { path: "/" });
                    return reply.status(401).send({ error: "Google token expired or invalid" });
                }
                const err = await propRes.text();
                request.log.error("Failed to create property: " + err);
                return reply.status(propRes.status).send({ error: "Failed to create property", details: err });
            }

            const newProperty = await propRes.json() as any;
            const newPropertyId = newProperty.name;

            let newStream = null;
            if (websiteUrl) {
                const streamRes = await fetch(`https://analyticsadmin.googleapis.com/v1beta/${newPropertyId}/dataStreams`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "WEB_DATA_STREAM",
                        displayName: `${displayName} Stream`,
                        webStreamData: { defaultUri: websiteUrl }
                    })
                });
                if (streamRes.ok) newStream = await streamRes.json();
            }

            return {
                success: true,
                property: { propertyId: newPropertyId, displayName: newProperty.displayName, account: parent },
                stream: newStream
            };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: "Internal server error during property creation" });
        }
    });

    server.get("/ga/streams/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const accessToken = request.cookies.google_access_token;
            if (!accessToken) return reply.status(401).send({ error: "Google access token missing" });

            const { propertyId } = request.params as { propertyId: string };
            const res = await fetch(`https://analyticsadmin.googleapis.com/v1beta/properties/${propertyId}/dataStreams`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    reply.clearCookie("google_access_token", { path: "/" });
                    return reply.status(401).send({ error: "Google token expired or invalid" });
                }
                const err = await res.text();
                request.log.error("Google API Error: " + err);
                return reply.status(res.status).send({ error: "Failed to fetch streams from Google", details: err });
            }

            const data = await res.json() as any;

            const streams = data.dataStreams?.map((stream: any) => ({
                name: stream.displayName,
                measurementId: stream.webStreamData?.measurementId || null
            })) || [];

            return { streams };
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch GA streams" });
        }
    });

    // -------------------------------------------------------------------------
    // REFACTORED LAZY CACHING ENDPOINTS 
    // -------------------------------------------------------------------------

    server.get("/ga/report/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const { propertyId } = request.params as { propertyId: string };
            const rows = await getCachedAnalytics(propertyId);

            let users = 0, sessions = 0, pageViews = 0, bounceRate = 0, avgSessionDuration = 0, newUsers = 0;
            for (const row of rows) {
                users += Number(row.users);
                sessions += Number(row.sessions);
                pageViews += Number(row.page_views);
                bounceRate += Number(row.bounce_rate);
                avgSessionDuration += Number(row.avg_session_duration);
                newUsers += Number(row.new_users);
            }
            if (rows.length > 0) {
                bounceRate = bounceRate / rows.length;
                avgSessionDuration = avgSessionDuration / rows.length;
            }

            return { users, sessions, pageViews, bounceRate, avgSessionDuration, newUsers };
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch cached report" });
        }
    });

    server.get("/ga/timeseries/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const { propertyId } = request.params as { propertyId: string };
            const rows = await getCachedAnalytics(propertyId);

            const dates = rows.map((r: any) => {
                const d = new Date(r.record_date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            });
            const users = rows.map((r: any) => Number(r.users));

            return { dates, users };
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch cached timeseries" });
        }
    });

    server.get("/ga/sources/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const { propertyId } = request.params as { propertyId: string };
            const rows = await getCachedAnalytics(propertyId);
            return aggregateJSONBreakdown(rows, "source_data");
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch sources" });
        }
    });

    server.get("/ga/devices/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const { propertyId } = request.params as { propertyId: string };
            const rows = await getCachedAnalytics(propertyId);
            return aggregateJSONBreakdown(rows, "device_data");
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch devices" });
        }
    });

    server.get("/ga/pages/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const { propertyId } = request.params as { propertyId: string };
            const rows = await getCachedAnalytics(propertyId);
            return aggregateJSONBreakdown(rows, "page_data");
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch pages" });
        }
    });

    server.get("/ga/events/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const { propertyId } = request.params as { propertyId: string };
            const rows = await getCachedAnalytics(propertyId);
            return aggregateJSONBreakdown(rows, "event_data");
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch events" });
        }
    });

    server.get("/ga/locations/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const { propertyId } = request.params as { propertyId: string };
            const rows = await getCachedAnalytics(propertyId);
            return aggregateJSONBreakdown(rows, "location_data");
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch locations" });
        }
    });

    server.get("/ga/hourly/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const { propertyId } = request.params as { propertyId: string };
            const rows = await getCachedAnalytics(propertyId);
            // Sort by hour key chronologically (00, 01, ..., 23)
            return aggregateJSONBreakdown(rows, "hourly_data", false);
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch hourly data" });
        }
    });
    server.get("/ga/insights/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });
            const { propertyId } = request.params as { propertyId: string };
            const cleanId = propertyId.replace("properties/", "");

            const pool = getPool();
            const [rows] = await pool.execute(
                `SELECT insights_json, alerts_json
                 FROM insights_alerts
                 WHERE property_id = ?
                 ORDER BY record_date DESC
                 LIMIT 1`,
                [cleanId]
            ) as any[];

            if (!rows.length) {
                return { insights: [], alerts: [] };
            }

            return {
                insights: rows[0].insights_json || [],
                alerts: rows[0].alerts_json || []
            };
        } catch (err: any) {
            request.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch AI insights" });
        }
    });

}
