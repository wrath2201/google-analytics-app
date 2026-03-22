import { FastifyInstance } from "fastify";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export default async function gaRoutes(server: FastifyInstance) {

    server.get("/ga/properties", async (request, reply) => {

        try {

            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;
            console.log("ACCESS TOKEN:", accessToken);


            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }

            const res = await fetch(
                "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            const data = await res.json() as any;

            console.log("GA API RESPONSE:", JSON.stringify(data, null, 2));

            const properties =
                data.accountSummaries?.flatMap((account: any) =>
                    (account.propertySummaries || []).map((prop: any) => ({
                        propertyId: prop.property,
                        displayName: prop.displayName
                    }))
                ) || [];

            return { properties };

        } catch (err) {

            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch GA properties" });

        }

    });


    server.get("/ga/streams/:propertyId", async (request, reply) => {
        try {

            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;

            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }

            const { propertyId } = request.params as { propertyId: string };

            const res = await fetch(
                `https://analyticsadmin.googleapis.com/v1beta/properties/${propertyId}/dataStreams`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            const data = await res.json() as any;

            const streams =
                data.dataStreams?.map((stream: any) => ({
                    name: stream.displayName,
                    measurementId: stream.webStreamData?.measurementId || null
                })) || [];

            return { streams };

        } catch (err) {

            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch GA streams" });

        }
    });

    server.get("/ga/report/:propertyId", async (request, reply) => {
        try {

            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;
            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }


            console.log("ACCESS TOKEN:", accessToken);

            const { propertyId } = request.params as { propertyId: string };
            const cleanId = propertyId.replace("properties/", "");

            const input = {
                dateRanges: [
                    { startDate: "7daysAgo", endDate: "today" }
                ],
                metrics: [
                    { name: "activeUsers" },
                    { name: "sessions" },
                    { name: "screenPageViews" },
                    { name: "bounceRate" },
                    { name: "averageSessionDuration" },
                    { name: "newUsers" }
                ]
            };

            const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${cleanId}:runReport`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(input)
            });

            if (!res.ok) {
                const errorText = await res.text();
                server.log.error(errorText);
                return reply.status(res.status).send({ error: "Analytics API failure" });
            }

            const data = await res.json() as any;
            console.log("GA REPORT RESPONSE:", JSON.stringify(data, null, 2));
            const metrics = data.rows?.[0]?.metricValues || [];

            return {
                users: metrics[0]?.value || 0,
                sessions: metrics[1]?.value || 0,
                pageViews: metrics[2]?.value || 0,
                bounceRate: metrics[3]?.value || 0,
                avgSessionDuration: metrics[4]?.value || 0,
                newUsers: metrics[5]?.value || 0
            };

        } catch (err) {

            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch analytics report" });

        }
    });

    // server.get("/ga/report/:propertyId", async (request, reply) => {
    //     try {
    //         await request.jwtVerify({ onlyCookie: true });

    //         const accessToken = request.cookies.google_access_token;
    //         console.log("ACCESS TOKEN (NOT USED BY SWYTCH):", accessToken);

    //         const { propertyId } = request.params as { propertyId: string };

    //         const payload = {
    //             tool: "v1beta.{property}:runreport.create", //  MUST match tooling.json
    //             args: {
    //                 property: `properties/${propertyId}`,   //  MUST include "properties/"
    //                 dateRanges: [
    //                     { startDate: "7daysAgo", endDate: "today" }
    //                 ],
    //                 metrics: [
    //                     { name: "activeUsers" },
    //                     { name: "sessions" },
    //                     { name: "screenPageViews" },
    //                     { name: "bounceRate" },
    //                     { name: "averageSessionDuration" },
    //                     { name: "newUsers" }
    //                 ]
    //             }
    //         };

    //         console.log("SWYTCH PAYLOAD:", JSON.stringify(payload, null, 2));

    //         const command = `echo '${JSON.stringify(payload)}' | swytchcode exec`;

    //         const { stdout, stderr } = await execPromise(command);

    //         if (stderr) {
    //             console.error("SWYTCH STDERR:", stderr);
    //         }

    //         console.log("SWYTCH RAW RESPONSE:", stdout);

    //         const data = JSON.parse(stdout);

    //         const metrics = data.rows?.[0]?.metricValues || [];

    //         return {
    //             users: metrics[0]?.value || 0,
    //             sessions: metrics[1]?.value || 0,
    //             pageViews: metrics[2]?.value || 0,
    //             bounceRate: metrics[3]?.value || 0,
    //             avgSessionDuration: metrics[4]?.value || 0,
    //             newUsers: metrics[5]?.value || 0
    //         };

    //     } catch (err) {
    //         console.error("SWYTCH ERROR:", err);
    //         return reply.status(500).send({ error: "Swytchcode failed" });
    //     }
    // });

    server.get("/ga/timeseries/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;
            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }

            const { propertyId } = request.params as { propertyId: string };
            const cleanId = propertyId.replace("properties/", "");

            const input = {
                dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
                dimensions: [{ name: "date" }],
                metrics: [{ name: "activeUsers" }]
            };

            const res = await fetch(
                `https://analyticsdata.googleapis.com/v1beta/properties/${cleanId}:runReport`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(input)
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                console.log("GA ERROR FULL:", errorText);
                return reply.status(res.status).send({ error: errorText });
            }

            const data = await res.json() as any;

            const dates: string[] = [];
            const users: number[] = [];

            if (data.rows && data.rows.length > 0) {
                for (const row of data.rows) {
                    const rawDate = row.dimensionValues?.[0]?.value || "";

                    const formattedDate =
                        rawDate.length === 8
                            ? `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`
                            : rawDate;

                    dates.push(formattedDate);
                    users.push(Number(row.metricValues?.[0]?.value || 0));
                }
            } else {
                dates.push("No Data");
                users.push(0);
            }

            return { dates, users };

        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch timeseries data" });
        }
    });


    // const execAsync=util.promisify(exec);
    // server.get("/ga/timeseries/:propertyId", async (request, reply) => {
    //     try {
    //         await request.jwtVerify({ onlyCookie: true });

    //         const { propertyId } = request.params as { propertyId: string };

    //         const payload = {
    //             tool: "v1beta.{property}:runreport.create",
    //             args: {
    //                 property: `properties/${propertyId}`,
    //                 dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    //                 dimensions: [{ name: "date" }],
    //                 metrics: [{ name: "activeUsers" }]
    //             }
    //         };

    //         console.log("SWYTCH PAYLOAD:", JSON.stringify(payload, null, 2));

    //         const { stdout, stderr } = await execAsync(
    //             `echo '${JSON.stringify(payload)}' | swytchcode exec`
    //         );

    //         if (stderr) {
    //             console.error("SWYTCH ERROR:", stderr);
    //             return reply.status(500).send({ error: stderr });
    //         }

    //         const data = JSON.parse(stdout);

    //         const dates: string[] = [];
    //         const users: number[] = [];

    //         if (data.rows && data.rows.length > 0) {
    //             for (const row of data.rows) {
    //                 const rawDate = row.dimensionValues?.[0]?.value || "";

    //                 const formattedDate =
    //                     rawDate.length === 8
    //                         ? `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`
    //                         : rawDate;

    //                 dates.push(formattedDate);
    //                 users.push(Number(row.metricValues?.[0]?.value || 0));
    //             }
    //         } else {
    //             dates.push("No Data");
    //             users.push(0);
    //         }

    //         return { dates, users };

    //     } catch (err) {
    //         request.log.error(err);
    //         return reply.status(500).send({ error: "Failed to fetch timeseries data (Swytch)" });
    //     }
    // });



    server.get("/ga/sources/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;
            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }

            const { propertyId } = request.params as { propertyId: string };
            const cleanId = propertyId.replace("properties/", "");

            const input = {
                dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
                dimensions: [{ name: "sessionSource" }],
                metrics: [{ name: "activeUsers" }]
            };

            const res = await fetch(
                `https://analyticsdata.googleapis.com/v1beta/properties/${cleanId}:runReport`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(input)
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                console.log("GA ERROR FULL:", errorText);
                return reply.status(res.status).send({ error: errorText });
            }

            const data = await res.json() as any;

            const labels: string[] = [];
            const values: number[] = [];

            if (data.rows && data.rows.length > 0) {
                for (const row of data.rows) {
                    labels.push(row.dimensionValues?.[0]?.value || "Unknown");
                    values.push(Number(row.metricValues?.[0]?.value || 0));
                }
            } else {
                labels.push("No Data");
                values.push(0);
            }

            return { labels, values };

        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch sources" });
        }
    });

    // server.get("/ga/sources/:propertyId", async (request, reply) => {
    //     try {
    //         await request.jwtVerify({ onlyCookie: true });
    // 
    //         const { propertyId } = request.params as { propertyId: string };
    //         const cleanId = propertyId.replace("properties/", "");
    // 
    //         const payload = {
    //             tool: "v1beta.{property}:runreport.create",
    //             args: {
    //                 property: `properties/${cleanId}`,
    //                 dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    //                 dimensions: [{ name: "sessionSource" }],
    //                 metrics: [{ name: "activeUsers" }]
    //             }
    //         };
    // 
    //         console.log("SWYTCH PAYLOAD:", JSON.stringify(payload, null, 2));
    // 
    //         const { stdout, stderr } = await execPromise(
    //             `echo '${JSON.stringify(payload)}' | swytchcode exec`
    //         );
    // 
    //         if (stderr) {
    //             console.error("SWYTCH ERROR:", stderr);
    //             return reply.status(500).send({ error: stderr });
    //         }
    // 
    //         const data = JSON.parse(stdout);
    // 
    //         const labels: string[] = [];
    //         const values: number[] = [];
    // 
    //         if (data.rows && data.rows.length > 0) {
    //             for (const row of data.rows) {
    //                 labels.push(row.dimensionValues?.[0]?.value || "Unknown");
    //                 values.push(Number(row.metricValues?.[0]?.value || 0));
    //             }
    //         } else {
    //             labels.push("No Data");
    //             values.push(0);
    //         }
    // 
    //         return { labels, values };
    // 
    //     } catch (err) {
    //         request.log.error(err);
    //         return reply.status(500).send({ error: "Failed to fetch sources (Swytch)" });
    //     }
    // });

    server.get("/ga/devices/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;
            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }

            const { propertyId } = request.params as { propertyId: string };
            const cleanId = propertyId.replace("properties/", "");

            const input = {
                dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
                dimensions: [{ name: "deviceCategory" }],
                metrics: [{ name: "activeUsers" }]
            };

            const res = await fetch(
                `https://analyticsdata.googleapis.com/v1beta/properties/${cleanId}:runReport`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(input)
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                console.log("GA ERROR FULL:", errorText);
                return reply.status(res.status).send({ error: errorText });
            }

            const data = await res.json() as any;

            const labels: string[] = [];
            const values: number[] = [];

            if (data.rows && data.rows.length > 0) {
                for (const row of data.rows) {
                    labels.push(row.dimensionValues?.[0]?.value || "Unknown");
                    values.push(Number(row.metricValues?.[0]?.value || 0));
                }
            } else {
                labels.push("No Data");
                values.push(0);
            }

            return { labels, values };

        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch devices" });
        }
    });

    // server.get("/ga/devices/:propertyId", async (request, reply) => {
    //     try {
    //         await request.jwtVerify({ onlyCookie: true });
    // 
    //         const { propertyId } = request.params as { propertyId: string };
    //         const cleanId = propertyId.replace("properties/", "");
    // 
    //         const payload = {
    //             tool: "v1beta.{property}:runreport.create",
    //             args: {
    //                 property: `properties/${cleanId}`,
    //                 dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    //                 dimensions: [{ name: "deviceCategory" }],
    //                 metrics: [{ name: "activeUsers" }]
    //             }
    //         };
    // 
    //         console.log("SWYTCH PAYLOAD:", JSON.stringify(payload, null, 2));
    // 
    //         const { stdout, stderr } = await execPromise(
    //             `echo '${JSON.stringify(payload)}' | swytchcode exec`
    //         );
    // 
    //         if (stderr) {
    //             console.error("SWYTCH ERROR:", stderr);
    //             return reply.status(500).send({ error: stderr });
    //         }
    // 
    //         const data = JSON.parse(stdout);
    // 
    //         const labels: string[] = [];
    //         const values: number[] = [];
    // 
    //         if (data.rows && data.rows.length > 0) {
    //             for (const row of data.rows) {
    //                 labels.push(row.dimensionValues?.[0]?.value || "Unknown");
    //                 values.push(Number(row.metricValues?.[0]?.value || 0));
    //             }
    //         } else {
    //             labels.push("No Data");
    //             values.push(0);
    //         }
    // 
    //         return { labels, values };
    // 
    //     } catch (err) {
    //         request.log.error(err);
    //         return reply.status(500).send({ error: "Failed to fetch devices (Swytch)" });
    //     }
    // });

    server.get("/ga/pages/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;
            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }

            const { propertyId } = request.params as { propertyId: string };
            const cleanId = propertyId.replace("properties/", "");

            const input = {
                dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
                dimensions: [{ name: "pagePath" }],
                metrics: [{ name: "screenPageViews" }]
            };

            const res = await fetch(
                `https://analyticsdata.googleapis.com/v1beta/properties/${cleanId}:runReport`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(input)
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                console.log("GA ERROR FULL:", errorText);
                return reply.status(res.status).send({ error: errorText });
            }

            const data = await res.json() as any;

            const labels: string[] = [];
            const values: number[] = [];

            if (data.rows && data.rows.length > 0) {
                for (const row of data.rows) {
                    labels.push(row.dimensionValues?.[0]?.value || "Unknown");
                    values.push(Number(row.metricValues?.[0]?.value || 0));
                }
            } else {
                labels.push("No Data");
                values.push(0);
            }

            return { labels, values };

        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch pages" });
        }
    });

    // server.get("/ga/pages/:propertyId", async (request, reply) => {
    //     try {
    //         await request.jwtVerify({ onlyCookie: true });
    // 
    //         const { propertyId } = request.params as { propertyId: string };
    //         const cleanId = propertyId.replace("properties/", "");
    // 
    //         const payload = {
    //             tool: "v1beta.{property}:runreport.create",
    //             args: {
    //                 property: `properties/${cleanId}`,
    //                 dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    //                 dimensions: [{ name: "pagePath" }],
    //                 metrics: [{ name: "screenPageViews" }]
    //             }
    //         };
    // 
    //         console.log("SWYTCH PAYLOAD:", JSON.stringify(payload, null, 2));
    // 
    //         const { stdout, stderr } = await execPromise(
    //             `echo '${JSON.stringify(payload)}' | swytchcode exec`
    //         );
    // 
    //         if (stderr) {
    //             console.error("SWYTCH ERROR:", stderr);
    //             return reply.status(500).send({ error: stderr });
    //         }
    // 
    //         const data = JSON.parse(stdout);
    // 
    //         const labels: string[] = [];
    //         const values: number[] = [];
    // 
    //         if (data.rows && data.rows.length > 0) {
    //             for (const row of data.rows) {
    //                 labels.push(row.dimensionValues?.[0]?.value || "Unknown");
    //                 values.push(Number(row.metricValues?.[0]?.value || 0));
    //             }
    //         } else {
    //             labels.push("No Data");
    //             values.push(0);
    //         }
    // 
    //         return { labels, values };
    // 
    //     } catch (err) {
    //         request.log.error(err);
    //         return reply.status(500).send({ error: "Failed to fetch pages (Swytch)" });
    //     }
    // });

    server.get("/ga/events/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;
            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }

            const { propertyId } = request.params as { propertyId: string };
            const cleanId = propertyId.replace("properties/", "");

            const input = {
                dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
                dimensions: [{ name: "eventName" }],
                metrics: [{ name: "eventCount" }]
            };

            const res = await fetch(
                `https://analyticsdata.googleapis.com/v1beta/properties/${cleanId}:runReport`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(input)
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                return reply.status(res.status).send({ error: errorText });
            }

            const data = await res.json() as any;

            const labels: string[] = [];
            const values: number[] = [];

            if (data.rows && data.rows.length > 0) {
                for (const row of data.rows) {
                    labels.push(row.dimensionValues?.[0]?.value || "Unknown");
                    values.push(Number(row.metricValues?.[0]?.value || 0));
                }
            } else {
                labels.push("No Data");
                values.push(0);
            }

            return { labels, values };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch events" });
        }
    });

    // server.get("/ga/events/:propertyId", async (request, reply) => {
    //     try {
    //         await request.jwtVerify({ onlyCookie: true });
    //         const { propertyId } = request.params as { propertyId: string };
    //         const cleanId = propertyId.replace("properties/", "");
    //         const payload = {
    //             tool: "v1beta.{property}:runreport.create",
    //             args: {
    //                 property: `properties/${cleanId}`,
    //                 dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    //                 dimensions: [{ name: "eventName" }],
    //                 metrics: [{ name: "eventCount" }]
    //             }
    //         };
    //         const { stdout, stderr } = await execPromise(`echo '${JSON.stringify(payload)}' | swytchcode exec`);
    //         if (stderr) return reply.status(500).send({ error: stderr });
    //         const data = JSON.parse(stdout);
    //         const labels: string[] = [];
    //         const values: number[] = [];
    //         if (data.rows && data.rows.length > 0) {
    //             for (const row of data.rows) {
    //                 labels.push(row.dimensionValues?.[0]?.value || "Unknown");
    //                 values.push(Number(row.metricValues?.[0]?.value || 0));
    //             }
    //         } else {
    //             labels.push("No Data");
    //             values.push(0);
    //         }
    //         return { labels, values };
    //     } catch (err) {
    //         return reply.status(500).send({ error: "Failed to fetch events (Swytch)" });
    //     }
    // });

    server.get("/ga/locations/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;
            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }

            const { propertyId } = request.params as { propertyId: string };
            const cleanId = propertyId.replace("properties/", "");

            const input = {
                dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
                dimensions: [{ name: "city" }],
                metrics: [{ name: "sessions" }]
            };

            const res = await fetch(
                `https://analyticsdata.googleapis.com/v1beta/properties/${cleanId}:runReport`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(input)
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                return reply.status(res.status).send({ error: errorText });
            }

            const data = await res.json() as any;

            const labels: string[] = [];
            const values: number[] = [];

            if (data.rows && data.rows.length > 0) {
                for (const row of data.rows) {
                    labels.push(row.dimensionValues?.[0]?.value || "Unknown");
                    values.push(Number(row.metricValues?.[0]?.value || 0));
                }
            } else {
                labels.push("No Data");
                values.push(0);
            }

            return { labels, values };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch locations" });
        }
    });

    // server.get("/ga/locations/:propertyId", async (request, reply) => {
    //     try {
    //         await request.jwtVerify({ onlyCookie: true });
    //         const { propertyId } = request.params as { propertyId: string };
    //         const cleanId = propertyId.replace("properties/", "");
    //         const payload = {
    //             tool: "v1beta.{property}:runreport.create",
    //             args: {
    //                 property: `properties/${cleanId}`,
    //                 dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    //                 dimensions: [{ name: "city" }],
    //                 metrics: [{ name: "sessions" }]
    //             }
    //         };
    //         const { stdout, stderr } = await execPromise(`echo '${JSON.stringify(payload)}' | swytchcode exec`);
    //         if (stderr) return reply.status(500).send({ error: stderr });
    //         const data = JSON.parse(stdout);
    //         const labels: string[] = [];
    //         const values: number[] = [];
    //         if (data.rows && data.rows.length > 0) {
    //             for (const row of data.rows) {
    //                 labels.push(row.dimensionValues?.[0]?.value || "Unknown");
    //                 values.push(Number(row.metricValues?.[0]?.value || 0));
    //             }
    //         } else {
    //             labels.push("No Data");
    //             values.push(0);
    //         }
    //         return { labels, values };
    //     } catch (err) {
    //         return reply.status(500).send({ error: "Failed to fetch locations (Swytch)" });
    //     }
    // });

    server.get("/ga/hourly/:propertyId", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });

            const accessToken = request.cookies.google_access_token;
            if (!accessToken) {
                return reply.status(401).send({ error: "Google access token missing" });
            }

            const { propertyId } = request.params as { propertyId: string };
            const cleanId = propertyId.replace("properties/", "");

            const input = {
                dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
                dimensions: [{ name: "hour" }],
                metrics: [{ name: "sessions" }]
            };

            const res = await fetch(
                `https://analyticsdata.googleapis.com/v1beta/properties/${cleanId}:runReport`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(input)
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                return reply.status(res.status).send({ error: errorText });
            }

            const data = await res.json() as any;

            const labels: string[] = [];
            const values: number[] = [];

            if (data.rows && data.rows.length > 0) {
                // Return data sorted by hour integer (optional frontend requirement, but here doing basic pull)
                for (const row of data.rows) {
                    labels.push(row.dimensionValues?.[0]?.value || "Unknown");
                    values.push(Number(row.metricValues?.[0]?.value || 0));
                }
            } else {
                labels.push("No Data");
                values.push(0);
            }

            return { labels, values };
        } catch (err) {
            request.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch hourly data" });
        }
    });

    // server.get("/ga/hourly/:propertyId", async (request, reply) => {
    //     try {
    //         await request.jwtVerify({ onlyCookie: true });
    //         const { propertyId } = request.params as { propertyId: string };
    //         const cleanId = propertyId.replace("properties/", "");
    //         const payload = {
    //             tool: "v1beta.{property}:runreport.create",
    //             args: {
    //                 property: `properties/${cleanId}`,
    //                 dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
    //                 dimensions: [{ name: "hour" }],
    //                 metrics: [{ name: "sessions" }]
    //             }
    //         };
    //         const { stdout, stderr } = await execPromise(`echo '${JSON.stringify(payload)}' | swytchcode exec`);
    //         if (stderr) return reply.status(500).send({ error: stderr });
    //         const data = JSON.parse(stdout);
    //         const labels: string[] = [];
    //         const values: number[] = [];
    //         if (data.rows && data.rows.length > 0) {
    //             for (const row of data.rows) {
    //                 labels.push(row.dimensionValues?.[0]?.value || "Unknown");
    //                 values.push(Number(row.metricValues?.[0]?.value || 0));
    //             }
    //         } else {
    //             labels.push("No Data");
    //             values.push(0);
    //         }
    //         return { labels, values };
    //     } catch (err) {
    //         return reply.status(500).send({ error: "Failed to fetch hourly data (Swytch)" });
    //     }
    // });

}