import express from "express";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Client } = pkg;

const router = express.Router();

router.get("/check-db", async (req, res) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
   // ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query("SELECT NOW()");
    await client.end();
    res.json({
      success: true,
      message: "✅ Database Connected Successfully!",
      time: result.rows[0].now,
    });
  } catch (err : any) {
    res.status(500).json({
      success: false,
      message: "❌ Database Connection Failed!",
      error: err.message,
    });
  }
});

export default router;
