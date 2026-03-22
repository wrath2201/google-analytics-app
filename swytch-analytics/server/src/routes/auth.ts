import { FastifyInstance } from "fastify";
import { getPool } from "../plugins/mysql";
import { verifyFirebaseToken } from "../swytch/commands";

// ─── Normalize response from SwytchCode or Firebase REST ────
// SwytchCode may return: { users: [...] } or { data: { users: [...] } }
function extractUsers(data: any): any[] | null {
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.data?.users)) return data.data.users;
    return null;
}

// ─── Fallback: call Firebase REST API directly ───────────────
async function firebaseFallback(idToken: string) {
    const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        }
    );
    return res.json();
}

export default async function authRoutes(server: FastifyInstance) {

    server.post("/auth", async (request, reply) => {
        const { idToken, accessToken } = request.body as { idToken: string, accessToken?: string };

        if (!idToken) {
            return reply.status(400).send({ error: "idToken is required" });
        }

        let firebaseUser: any;
        let provider = "swytch";

        // ── STEP 1: Try SwytchCode (with one retry) ──────────
        try {
            let data: any = null;
            let lastError: any = null;

            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    data = await verifyFirebaseToken(idToken);

                    if (process.env.DEBUG_AUTH === "true") {
                        server.log.info({
                            layer: "auth",
                            attempt,
                            raw: data
                        }, "SwytchCode raw response");
                    }

                    const users = extractUsers(data);

                    if (!users || users.length === 0) {
                        return reply.status(401).send({ error: "Invalid token" });
                    }

                    firebaseUser = users[0];
                    break;

                } catch (err) {
                    lastError = err;
                    server.log.warn({
                        layer: "auth",
                        attempt,
                        err
                    }, `SwytchCode attempt ${attempt} failed`);

                    // Wait briefly before retry
                    if (attempt === 1) {
                        await new Promise(res => setTimeout(res, 300));
                    }
                }
            }

            // ── STEP 2: Fallback if SwytchCode failed ─────────
            if (!firebaseUser) {
                server.log.info({
                    layer: "auth",
                    provider: "firebase_fallback",
                    status: "used"
                }, "Falling back to Firebase REST API");

                provider = "firebase_fallback";
                const fallbackData = await firebaseFallback(idToken);
                const users = extractUsers(fallbackData);

                if (!users || users.length === 0) {
                    return reply.status(401).send({ error: "Invalid token" });
                }

                firebaseUser = users[0];
            }

        } catch (err) {
            server.log.error({
                layer: "auth",
                status: "error",
                error: err
            }, "Auth failed completely");
            return reply.status(500).send({ error: "Internal server error" });
        }

        // ── STEP 3: Upsert user into DB ──────────────────────
        try {
            const pool = getPool();

            // Upsert user — matches actual DB schema (firebase_uid, display_name, photo_url, id INT AUTO_INCREMENT)
            await pool.execute(
                `INSERT INTO users (firebase_uid, email, display_name, photo_url)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                     email        = VALUES(email),
                     display_name = VALUES(display_name),
                     photo_url    = VALUES(photo_url)`,
                [
                    firebaseUser.localId,
                    firebaseUser.email,
                    firebaseUser.displayName || null,
                    firebaseUser.photoUrl || null,
                ]
            );

            // Get internal DB user id
            const [rows] = await pool.execute(
                `SELECT id FROM users WHERE firebase_uid = ?`,
                [firebaseUser.localId]
            ) as any;

            const dbUser = rows[0];

            // Create free subscription if new user (id is AUTO_INCREMENT — no UUID needed)
            await pool.execute(
                `INSERT IGNORE INTO subscriptions (user_id, plan, apps_allowed)
                 VALUES (?, 'free', 1)`,
                [dbUser.id]
            );

            // ── STEP 4: Sign JWT + set cookie ─────────────────
            const token = server.jwt.sign(
                {
                    uid: firebaseUser.localId,
                    db_id: dbUser.id,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || null,
                    picture: firebaseUser.photoUrl || null,
                },
                { expiresIn: "7d" }
            );

            server.log.info({
                layer: "auth",
                provider,
                status: "success",
                email: firebaseUser.email
            }, "Auth successful");

            return reply
                .setCookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                })
                .setCookie("google_access_token", accessToken || "", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7,
                })
                .send({ success: true });

        } catch (err) {
            server.log.error({
                layer: "auth",
                status: "error",
                error: err
            }, "DB/JWT error during auth");
            return reply.status(500).send({ error: "Internal server error" });
        }
    });

    server.delete("/auth", async (request, reply) => {
        return reply
            .clearCookie("token", {
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            })
            .clearCookie("google_access_token", {
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
            })
            .send({ success: true });
    });
}
