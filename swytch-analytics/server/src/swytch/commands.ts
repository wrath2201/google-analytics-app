import exec from "./client";

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