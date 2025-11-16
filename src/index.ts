// index.js
import "dotenv/config";
import app from "./app"; // <-- app.js import
import pool from "./config/database";

// Fix BigInt serialization issue for Prisma/Postgres IDs
declare global {
  interface BigInt {
    toJSON(): string;
  }
}


// Extend BigInt prototype safely
(BigInt.prototype as any).toJSON = function (): string {
  return this.toString();
};

const PORT: number = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing server...");
  server.close(async () => {
    await pool.end();
    console.log("DB pool closed. Bye!");
    process.exit(0);
  });
});
