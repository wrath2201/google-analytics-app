import { FastifyInstance } from "fastify";
import { getPool } from "../plugins/mysql";

export default async function appsRoutes(server: FastifyInstance) {

    server.post("/apps", async (request, reply) => {

        try {

            const user = await request.jwtVerify() as any;

            const {
                propertyId,
                websiteUrl,
                businessType,
                primaryGoal
            } = request.body as {
                propertyId: string;
                websiteUrl: string;
                businessType: string;
                primaryGoal: string;
            };

            if (!propertyId || !websiteUrl) {
                return reply.status(400).send({
                    error: "propertyId and websiteUrl are required"
                });
            }

            const pool = getPool();

            const [appResult] = await pool.execute(
                `INSERT INTO apps
                 (user_id, app_name, website_url, business_type, primary_goal)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    user.db_id,
                    websiteUrl,
                    websiteUrl,
                    businessType || null,
                    primaryGoal || null
                ]
            ) as any;

            const appId = appResult.insertId;

            await pool.execute(
                `INSERT INTO ga_connections
                 (app_id, ga_property_id)
                 VALUES (?, ?)`,
                [
                    appId,
                    propertyId
                ]
            );

            return {
                success: true,
                appId
            };

        } catch (err) {

            server.log.error(err);

            return reply.status(500).send({
                error: "Failed to create app"
            });

        }

    });

}