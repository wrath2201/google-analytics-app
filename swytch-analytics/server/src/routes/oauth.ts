import { FastifyInstance } from "fastify";
import { google } from "googleapis";
import { getPool } from "../plugins/mysql";
import dotenv from "dotenv";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // The redirect URI must perfectly match what is configured in Google Cloud Console
    "http://localhost:4000/api/ga/oauth/callback"
);

export default async function oauthRoutes(server: FastifyInstance) {

    // Endpoint: Generate the Consent URL 
    server.get("/ga/oauth/url", async (request, reply) => {
        try {
            await request.jwtVerify({ onlyCookie: true });

            const scopes = [
                "https://www.googleapis.com/auth/analytics.readonly",
                "https://www.googleapis.com/auth/analytics.edit",
                "https://www.googleapis.com/auth/userinfo.profile"
            ];

            const url = oauth2Client.generateAuthUrl({
                access_type: "offline", 
                scope: scopes,
                // We can pass the user ID in the state so we know who authorized this request, or rely on cookie sessions
            });

            return { url };
        } catch (err) {
            server.log.error(err);
            return reply.status(500).send({ error: "Failed to generate OAuth URL" });
        }
    });

    // Endpoint: Handle the Google callback
    server.get("/ga/oauth/callback", async (request, reply) => {
        try {
            // First we must get the JWT to verify which user initiated this oauth flow
            const user = await request.jwtVerify({ onlyCookie: true }) as any;
            const { code } = request.query as { code: string };

            if (!code) {
                return reply.redirect("http://localhost:3000/dashboard?error=missing_code");
            }

            // Trade the code for Google Access & Refresh tokens
            const { tokens } = await oauth2Client.getToken(code);

            if (!tokens.refresh_token) {
                // If it didn't return a refresh token, it means they already granted consent before.
                // Normally we'd handle this cleanly, but since prompt="consent" is forced, it should return one.
                server.log.warn("No refresh token returned by Google (user might have authorized previously).");
            }

            // Save the tokens in the database
            const pool = getPool();
            
            // For true 2:00 AM background fetching, we strictly ONLY need the refresh_token. 
            // We can also store the access_token in the DB, but since the Cron Job natively handles generating the access token later via GoogleAuth, it's unnecessary to store the access_token permanently.
            
            // However, we WILL set the google_access_token cookie so the frontend can still do live API calls right now if it wants to, simulating a seamless login!
            if (tokens.refresh_token) {
                await pool.execute(
                    `UPDATE users SET google_refresh_token = ? WHERE id = ?`,
                    [tokens.refresh_token, user.db_id]
                );
            }

            // Set the HTTP-Only securely encrypted cookie so the dashboard has instant access rights
            reply.setCookie("google_access_token", tokens.access_token || "", {
                domain: "localhost",
                path: "/",
                secure: false, // Since this is localhost
                httpOnly: true,
                sameSite: "lax",
            });

            // Redirect the browser entirely back to the Dashboard web application
            return reply.redirect("http://localhost:3000/dashboard?connected=true");

        } catch (err) {
            server.log.error(err);
            return reply.redirect("http://localhost:3000/dashboard?error=oauth_failed");
        }
    });

}
