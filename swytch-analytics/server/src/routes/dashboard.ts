import { FastifyInstance } from "fastify";
import { getPool } from "../plugins/mysql";
import swytchExec from "../swytch/client";
import { getOrRefreshAccessToken } from "../services/googleAuth";

export default async function dashboardRoutes(server: FastifyInstance) {

  server.get("/dashboard/:appId", async (request, reply) => {

    const user = await request.jwtVerify() as any;
    const { appId } = request.params as any;

    const accessToken = await getOrRefreshAccessToken(request, reply, server);
    if (!accessToken) {
      return reply.status(401).send({ error: "Google access token missing" });
    }

    const pool = getPool();

    const [rows]: any = await pool.execute(
      `SELECT gc.property_id
       FROM ga_connections gc
       JOIN apps a ON gc.app_id = a.id
       WHERE a.id = ? AND a.user_id = ?`,
      [appId, user.db_id]
    );

    if (!rows.length) {
      return reply.status(404).send({ error: "App not found" });
    }

    const propertyId = rows[0].property_id;

    // Ensure correct GA property format
    const propertyPath = propertyId.startsWith("properties/")
      ? propertyId
      : `properties/${propertyId}`;

    const input = {
      property: propertyPath,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: {
        dateRanges: [
      { startDate: "7daysAgo", endDate: "today" }
    ],

    dimensions: [
      { name: "date" }
    ],

    metrics: [
      { name: "activeUsers" },
      { name: "sessions" },
      { name: "screenPageViews" }
    ],

    orderBys: [
      {
        dimension: { dimensionName: "date" }
      }
    ]
  }
};

    try {

      // Swytchcode execution via SDK
      const result = await swytchExec("v1beta.{property}:runreport.create", input);

      return result;

    } catch (err: any) {

      server.log.error(err);
      return reply.status(500).send({ error: err.message || "Swytchcode execution failed" });

    }

  });

}