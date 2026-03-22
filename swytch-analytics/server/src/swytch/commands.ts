import exec from "./client";

// Firebase Auth via SwytchCode (integration)
// Uses accounts:lookup to verify a Firebase idToken
// Timeout: 5s via AbortController

export async function verifyFirebaseToken(idToken: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    // this calls swytchcode cli and also passes api key +idtoken (crux of the integration)
    try {
        const result = await exec("accounts:lookup.accounts:lookup.create", {
            params: {
                key: process.env.FIREBASE_API_KEY, // from .env file
            },
            body: { idToken },
        });
        return result;
    } finally {
        clearTimeout(timeout);
    }
}

// ─── Resend Email via SwytchCode ─────────────────────────────
export async function sendEmail({
    to,
    subject,
    html,
    from,
}: {
    to: string;
    subject: string;
    html: string;
    from?: string;
}) {
    const result = await exec("emails.email.create", {
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: {
            from: from || process.env.REPORT_FROM_EMAIL || "onboarding@resend.dev",
            to,
            subject,
            html,
        },
    });

    return result;
}