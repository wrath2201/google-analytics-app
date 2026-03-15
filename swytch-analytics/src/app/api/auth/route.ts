import { NextRequest, NextResponse } from "next/server";

// TODO: Implement authentication API route
// - POST: Verify Firebase token and create session
// - DELETE: Clear session / logout

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // TODO: Verify Firebase ID token
        // TODO: Create session cookie or return JWT
        return NextResponse.json({ message: "Auth endpoint — not yet implemented" }, { status: 501 });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE() {
    // TODO: Clear session
    return NextResponse.json({ message: "Logout endpoint — not yet implemented" }, { status: 501 });
}
