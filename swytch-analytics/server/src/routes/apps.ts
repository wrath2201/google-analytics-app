import { FastifyInstance } from "fastify";
import { createApp, getUserApps, deleteApp } from "../services/apps";
import { authenticate } from "../plugins/authenticate";

export default async function appsRoutes(server: FastifyInstance) {

    // ── GET /api/apps ────────────────────────────────────────
    server.get("/apps", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user as any;
            const apps = await getUserApps(user.db_id);
            return { success: true, apps };
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch apps" });
        }
    });

    // ── POST /api/apps ───────────────────────────────────────
    server.post("/apps", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user as any;
            const { name, url } = request.body as {
                name: string;
                url: string;
            };

            if (!name || !url) {
                return reply.status(400).send({
                    error: "name and url are required"
                });
            }

            const result = await createApp(user.db_id, { name, url });

            if (!result.success) {
                return reply.status(403).send({ error: result.error });
            }

            return reply.status(201).send({ success: true, app: result.app });

        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to create app" });
        }
    });

    // ── DELETE /api/apps/:id ─────────────────────────────────
    server.delete("/apps/:id", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user as any;
            const { id } = request.params as { id: string };

            const result = await deleteApp(user.db_id, Number(id));

            if (!result.success) {
                return reply.status(404).send({ error: result.error });
            }

            return { success: true };

        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to delete app" });
        }
    });
}