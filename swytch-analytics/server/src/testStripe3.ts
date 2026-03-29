import "dotenv/config";
import { getPool } from "./plugins/mysql";
import { createProCheckoutSession } from "./services/stripe";

async function run() {
    try {
        console.log("Testing createProCheckoutSession...");
        const result = await createProCheckoutSession(3, "test@swytch.dev", "Test User");
        console.log("SUCCESS! URL:", result.url);
    } catch (err: any) {
        console.error("CRASH TRACE:", err);
    }
    process.exit(0);
}

run();
