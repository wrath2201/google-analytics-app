import fastifyJwt from "@fastify/jwt";
import { FastifyInstance } from "fastify";

export default async function jwt(server: FastifyInstance) {
    server.register(fastifyJwt, {
        secret: process.env.JWT_SECRET || "dev_secret_change_in_production",
    });
}