import { FastifyInstance } from "fastify";
import { getPool } from "../plugins/mysql";

export default async function authRoutes(server: FastifyInstance) {
    server.post("/auth", async (request, reply) => {
        const { idToken } = request.body as { idToken: string };

        if (!idToken) {
            return reply.status(400).send({ error: "idToken is required" });
        }

        try {
            // Verify token via Firebase public API
            const res = await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken }),
                }
            );

            const data = await res.json() as {
                users?: {
                    localId: string;
                    email: string;
                    displayName: string;
                    photoUrl: string;
                }[]
            };

            if (!data.users || data.users.length === 0) {
                return reply.status(401).send({ error: "Invalid token" });
            }

            const firebaseUser = data.users[0];
            const pool = getPool();

            // Upsert user into DB
            const [rows] = await pool.execute(
                `INSERT INTO users (firebase_uid, email, display_name, photo_url)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 email = VALUES(email),
                 display_name = VALUES(display_name),
                 photo_url = VALUES(photo_url)`,
                [
                    firebaseUser.localId,
                    firebaseUser.email,
                    firebaseUser.displayName || null,
                    firebaseUser.photoUrl || null,
                ]
            ) as any;

            // Get the user ID from DB
            const [users] = await pool.execute(
                `SELECT id FROM users WHERE firebase_uid = ?`,
                [firebaseUser.localId]
            ) as any;

            const dbUser = users[0];

            // Create subscription record if not exists
            await pool.execute(
                `INSERT IGNORE INTO subscriptions (user_id, plan, apps_allowed)
                 VALUES (?, 'free', 1)`,
                [dbUser.id]
            );

            // Sign JWT with db_id included
            const token = server.jwt.sign(
                {
                    uid: firebaseUser.localId,
                    db_id: dbUser.id,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName,
                    picture: firebaseUser.photoUrl,
                },
                { expiresIn: "7d" }
            );

            return reply
                .setCookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                })
                .send({ success: true });
        } catch (err) {
            server.log.error({ err }, "Auth error");
            return reply.status(401).send({ error: "Invalid token" });
        }
    });

    server.delete("/auth", async (request, reply) => {
        return reply
            .clearCookie("token", { path: "/" })
            .send({ success: true });
    });
}
