import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import rateLimit from "@fastify/rate-limit";

import mysqlPlugin from "./plugins/mysql";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import gaRoutes from "./routes/ga";
import appsRoutes from "./routes/apps";
import subscriptionRoutes from "./routes/subscriptions";
import emailReportsRoutes from "./routes/email_reports";
import stripeRoutes from "./routes/stripe";
import testEmailRoutes from "./routes/test-email";

import { startEmailReportsCron } from "./services/email_reports";
import { startAnalyticsCron } from "./cron/analyticsSync";
import { startInsightsCron } from "./cron/insightsSync";

const server = Fastify({ logger: true });

const start = async () => {

    await server.register(fastifyCors, {
        origin: ["http://localhost:3000", "http://localhost:3001", "http://statsy.in", "https://statsy.in"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    });

    await server.register(fastifyCookie);

    await server.register(rateLimit, {
        global: false, // only applies where explicitly configured
    });

    await server.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || "dev_secret_change_in_production",
        cookie: {
            cookieName: "token",
            signed: false
        }
    });

    await server.register(mysqlPlugin);

    // Auth routes
    await server.register(authRoutes, { prefix: "/api" });

    // GA routes
    await server.register(gaRoutes, { prefix: "/api" });

    // Apps routes
    await server.register(appsRoutes, { prefix: "/api" });

    // Subscription routes
    await server.register(subscriptionRoutes, { prefix: "/api" });

    // Dashboard routes
    await server.register(dashboardRoutes, { prefix: "/api" });

    // Email reports routes
    await server.register(emailReportsRoutes, { prefix: "/api" });

    // Stripe routes
    await server.register(stripeRoutes, { prefix: "/api" });

    // Test email routes (disabled in production)
    if (process.env.NODE_ENV !== "production") {
        await server.register(testEmailRoutes, { prefix: "/api" });
    }

    // Health check
    server.get("/health", async () => {
        return { status: "ok" };
    });

    // Start scheduled cron jobs
    startEmailReportsCron();
    startAnalyticsCron();
    startInsightsCron();

    try {
        await server.listen({
            port: Number(process.env.PORT) || 4000,
            host: "0.0.0.0",
        });

        console.log("Server running on http://localhost:4000");

    } catch (err) {

        server.log.error(err);
        process.exit(1);

    }
};

start();