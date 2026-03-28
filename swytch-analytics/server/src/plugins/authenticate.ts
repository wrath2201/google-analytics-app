// ============================================================
// AUTHENTICATE PLUGIN
// Reusable JWT guard. Use as onRequest hook on any route.
// Automatically returns 401 for all JWT failures.
// ============================================================

import { FastifyRequest, FastifyReply } from "fastify";

export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        await request.jwtVerify();
    } catch (err) {
        return reply.status(401).send({ error: "Unauthorized" });
    }
}
