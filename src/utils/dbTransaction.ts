import pool from "../config/database";
import { PoolClient } from "pg";

// Generic type T allows the callback to return any type
const runTransaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect(); // dedicated connection
  try {
    await client.query("BEGIN"); // start transaction

    const result = await callback(client); // execute callback queries

    await client.query("COMMIT"); // commit if all queries succeed
    return result;
  } catch (error) {
    await client.query("ROLLBACK"); // rollback if any query fails
    throw error;
  } finally {
    client.release(); // release the connection
  }
};

export default runTransaction;
