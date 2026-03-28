// ============================================================
// APPS SERVICE
// Handles app creation with plan limit enforcement.
// ============================================================

import { getPool } from "../plugins/mysql";
import { canAddApp } from "./subscriptions";

export interface App {
    id: number;
    user_id: number;
    name: string;
    url: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAppInput {
    name: string;
    url: string;
}

// ── Get all apps for a user ──────────────────────────────────
export async function getUserApps(userId: number): Promise<App[]> {
    const pool = getPool();

    const [rows] = await pool.execute(
        `SELECT id, user_id, name, url, created_at, updated_at
         FROM apps
         WHERE user_id = ?
         ORDER BY created_at ASC`,
        [userId]
    ) as any;

    return rows;
}

// ── Create a new app (with plan limit check) ─────────────────
export async function createApp(
    userId: number,
    input: CreateAppInput
): Promise<{ success: boolean; error?: string; app?: App }> {
    const pool = getPool();

    // ── Check plan limit before inserting ───────────────────
    const { allowed, currentCount, limit, plan } = await canAddApp(userId);

    if (!allowed) {
        return {
            success: false,
            error: `Plan limit reached. Your ${plan} plan allows ${limit} app${limit === 1 ? "" : "s"}. You currently have ${currentCount}.`,
        };
    }

    // ── Insert new app ───────────────────────────────────────
    const [result] = await pool.execute(
        `INSERT INTO apps (user_id, name, url)
         VALUES (?, ?, ?)`,
        [userId, input.name, input.url]
    ) as any;

    // ── Fetch and return the created app ─────────────────────
    const [rows] = await pool.execute(
        `SELECT id, user_id, name, url, created_at, updated_at
         FROM apps WHERE id = ?`,
        [result.insertId]
    ) as any;

    return {
        success: true,
        app: rows[0],
    };
}

// ── Delete an app (owner check enforced) ─────────────────────
export async function deleteApp(
    userId: number,
    appId: number
): Promise<{ success: boolean; error?: string }> {
    const pool = getPool();

    // Only delete if this app belongs to this user
    const [result] = await pool.execute(
        `DELETE FROM apps WHERE id = ? AND user_id = ?`,
        [appId, userId]
    ) as any;

    if (result.affectedRows === 0) {
        return {
            success: false,
            error: "App not found or access denied.",
        };
    }

    return { success: true };
}