// database.ts
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined, // <-- convert string to number
  max: 20,                  // max connections in pool
  idleTimeoutMillis: 30000, // idle connection timeout
  connectionTimeoutMillis: 2000, // wait for connection timeout
});

// ✅ Test connection at startup
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected successfully!");
  } catch (err: any) {
    console.error("❌ DB connection error:", err.message);
  }
})();

export default pool;
