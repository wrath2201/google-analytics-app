import fastifyCors, { FastifyCorsOptions } from "@fastify/cors";
import { FastifyInstance } from "fastify";

export default async function cors(server: FastifyInstance) {
    await server.register(fastifyCors, {
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    } as FastifyCorsOptions);
}