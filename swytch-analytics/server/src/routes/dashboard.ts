import { FastifyInstance } from "fastify";
import { exec } from "child_process";
import util from "util";
import { getPool } from "../plugins/mysql";

const execAsync = util.promisify(exec);

export default async function dashboardRoutes(server: FastifyInstance) {

  server.get("/dashboard/:appId", async (request, reply) => {

    const user = await request.jwtVerify() as any;
    const { appId } = request.params as any;

    const pool = getPool();

    const [rows]: any = await pool.execute(
      `SELECT gc.ga_property_id
       FROM ga_connections gc
       JOIN apps a ON gc.app_id = a.id
       WHERE a.id = ? AND a.user_id = ?`,
      [appId, user.db_id]
    );

    if (!rows.length) {
      return reply.status(404).send({ error: "App not found" });
    }

    const propertyId = rows[0].ga_property_id;

    // Ensure correct GA property format
    const propertyPath = propertyId.startsWith("properties/")
      ? propertyId
      : `properties/${propertyId}`;

    const input = {
  property: propertyPath,
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

      // Swytchcode execution
      const command =
        `swytchcode exec "v1beta.{property}:runreport.create" '${JSON.stringify(input).replace(/'/g, "'\\''")}'`;

      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        server.log.error(stderr);
        return reply.status(500).send({ error: stderr });
      }

      const result = JSON.parse(stdout);

      return result;

    } catch (err) {

      server.log.error(err);
      return reply.status(500).send({ error: "Swytchcode execution failed" });

    }

  });

}