import { FastifyInstance } from "fastify";
import { getUserSubscription } from "../services/subscriptions";
import { getUserApps } from "../services/apps";
import { authenticate } from "../plugins/authenticate";

export default async function subscriptionRoutes(server: FastifyInstance) {

    server.get("/subscriptions/me", {
        onRequest: [authenticate]
    }, async (request, reply) => {
        try {
            const user = request.user as any;

            const [subscription, apps] = await Promise.all([
                getUserSubscription(user.db_id),
                getUserApps(user.db_id),
            ]);

            const plan = subscription?.plan ?? "free";
            const appsAllowed = subscription?.apps_allowed ?? 1;
            const appsUsed = apps.length;

            return {
                plan,
                status: subscription?.status ?? "active",
                appsUsed,
                appsAllowed,
                canAddMore: appsUsed < appsAllowed,
                stripe: {
                    customerId: subscription?.stripe_customer_id ?? null,
                    subscriptionId: subscription?.stripe_subscription_id ?? null,
                },
            };

        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to fetch subscription" });
        }
    });
}
