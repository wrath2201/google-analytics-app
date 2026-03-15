import { FastifyInstance } from "fastify";
import mysql from "mysql2/promise";

let pool: mysql.Pool;

export function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
        });
    }
    return pool;
}

export default async function mysqlPlugin(server: FastifyInstance) {
    const pool = getPool();

    // Test connection on startup
    try {
        const conn = await pool.getConnection();
        server.log.info("MySQL connected successfully");
        conn.release();
    } catch (err) {
        server.log.error({ err }, "MySQL connection failed");
        process.exit(1);
    }

    server.decorate("mysql", pool);
}