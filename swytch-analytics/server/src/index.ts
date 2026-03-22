import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";

import mysqlPlugin from "./plugins/mysql";
import authRoutes from "./routes/auth";
import dashboardRoutes from "./routes/dashboard";
import gaRoutes from "./routes/ga";
import appsRoutes from "./routes/apps";

import { startEmailReportsCron } from "./services/email_reports";

const server = Fastify({ logger: true });

const start = async () => {

    await server.register(fastifyCors, {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});
    

    await server.register(fastifyCookie);

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
    
    //ga routes
    await server.register(gaRoutes, { prefix: "/api" });
    
    //apps routes
    await server.register(appsRoutes, { prefix: "/api" });

    // Dashboard routes
    await server.register(dashboardRoutes, { prefix: "/api" });

    // Health check
    server.get("/health", async () => {
        return { status: "ok" };
    });

    try {

        startEmailReportsCron();

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