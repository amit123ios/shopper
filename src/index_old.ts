// index.ts
import app from "./app";       // OK
import pool from "./config/database";  // OK

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
