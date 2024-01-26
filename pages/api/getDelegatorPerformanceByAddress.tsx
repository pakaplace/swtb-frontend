// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});
const getDelegatorPerformanceByAddress = async (
  pool_address: string,
  delegator_address: string
) => {
  if (!process.env.DB_CONNECTION_URI) return Error("Missing DB_CONNECTION_URI");
  try {
    // Connect to the database
    console.log("Connecting");
    const client = await pool.connect();
    console.log("Connected");
    // Perform a query
    const result = await client.query(
      `SELECT * FROM delegation_pool.delegation_pool_events WHERE pool_address = $1 AND delegator_address = $2`,
      [pool_address, delegator_address]
    );
    // const result = await client.query(
    //   "SELECT * FROM delegation_pool.delegation_pool_events LIMIT 1000"
    //   //   [pool_address, delegator_address]
    // );
    // Release the client back to the pool
    client.release();
    // console.log("result", result.rows);
    // Return the query result
    return result.rows;
  } catch (err) {
    // Handle errors, such as connection errors
    console.error("Database query error", err);
    throw err;
  }
  // List delegator events here
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract pool_address and delegator_address from the query parameters
  const pool_address = req.query.pool_address as string;
  const delegator_address = req.query.delegator_address as string;

  // Check if both pool_address and delegator_address are provided
  if (!pool_address || !delegator_address) {
    return res.status(400).json({ error: "Missing address parameters." });
  }

  try {
    const rows = await getDelegatorPerformanceByAddress(
      pool_address,
      delegator_address
    );

    // If rows is empty but no error was thrown, it could mean no data was found
    if (!rows || rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No data found for the given addresses." });
    }

    res.status(200).json(rows);
  } catch (error) {
    // Log the error for server-side debugging
    console.error("Error in getDelegatorPerformanceByAddress:", error);

    // Respond with a 500 Internal Server Error status code and an error message
    res.status(500).json({
      error: "An error occurred while fetching the performance data.",
    });
  }
}
