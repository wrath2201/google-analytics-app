import { FastifyInstance } from "fastify";
import { google } from "googleapis";
import { getPool } from "../plugins/mysql";

export default async function oauthRoutes(server: FastifyInstance) {

    // Endpoint: Generate the Consent URL
    server.get("/ga/oauth/url", async (request, reply) => {
        try {
            // Verify the user is logged in
            const user = await request.jwtVerify({ onlyCookie: true }) as any;

            // Build oauth client fresh each request (ensures env vars are loaded)
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                "http://localhost:4000/api/ga/oauth/callback"
            );

            const scopes = [
                "https://www.googleapis.com/auth/analytics.readonly",
                "https://www.googleapis.com/auth/analytics.edit",
                "https://www.googleapis.com/auth/userinfo.profile"
            ];

            // Pass the JWT cookie value as state so the callback can identify the user
            // (Google's redirect back does NOT reliably carry httpOnly cookies)
            const rawToken = request.cookies.token || "";

            const url = oauth2Client.generateAuthUrl({
                access_type: "offline",
                scope: scopes,
                state: rawToken,   // carry the session JWT through the OAuth round-trip
            });

            server.log.info({ layer: "oauth", user: user.email }, "OAuth URL generated");
            return { url };

        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to generate OAuth URL" });
        }
    });

    // Endpoint: Handle the Google callback
    server.get("/ga/oauth/callback", async (request, reply) => {
        try {
            const { code, state, error } = request.query as { code?: string; state?: string; error?: string };

            // Handle user-denied or Google error
            if (error) {
                server.log.warn({ layer: "oauth", error }, "Google OAuth denied by user or error returned");
                return reply.redirect(`http://localhost:3000/dashboard?error=${error}`);
            }

            if (!code) {
                return reply.redirect("http://localhost:3000/dashboard?error=missing_code");
            }

            // Decode user from the state parameter (the JWT we passed earlier)
            if (!state) {
                return reply.redirect("http://localhost:3000/dashboard?error=missing_state");
            }

            let user: any;
            try {
                user = server.jwt.verify(state) as any;
            } catch {
                server.log.warn({ layer: "oauth" }, "Invalid JWT in OAuth state param");
                return reply.redirect("http://localhost:3000/dashboard?error=invalid_session");
            }

            // Build oauth client
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                "http://localhost:4000/api/ga/oauth/callback"
            );

            // Trade the code for Access + Refresh tokens
            const { tokens } = await oauth2Client.getToken(code);

            if (!tokens.refresh_token) {
                server.log.warn({ layer: "oauth" }, "No refresh token returned — user may have authorized before");
            }

            // Save refresh_token to DB
            const pool = getPool();
            if (tokens.refresh_token) {
                await pool.execute(
                    `UPDATE users SET google_refresh_token = ? WHERE id = ?`,
                    [tokens.refresh_token, user.db_id]
                );
                server.log.info({ layer: "oauth", user: user.email }, "Refresh token saved to DB");
            }

            // Set the access_token cookie so the frontend can make live GA API calls immediately
            reply.setCookie("google_access_token", tokens.access_token || "", {
                path: "/",
                secure: false,      // localhost — no HTTPS
                httpOnly: true,
                sameSite: "lax",
                maxAge: 60 * 60,    // 1 hour (matches Google access token lifetime)
            });

            server.log.info({ layer: "oauth", user: user.email }, "OAuth completed successfully");
            return reply.redirect("http://localhost:3000/dashboard?connected=true");

        } catch (err) {
            server.log.error({ layer: "oauth", err }, "OAuth callback failed");
            return reply.redirect("http://localhost:3000/dashboard?error=oauth_failed");
        }
    });

}
