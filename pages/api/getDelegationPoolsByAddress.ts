// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

import {
  DelegationEvent,
  getDelegatorPerformanceByAddress,
} from "./getDelegatorPerformanceByAddress";
import {
  RealtimeDelegatorPerformance,
  getRealtimeDelegatorPerformance,
} from "./getRealtimeDelegatorPerformance";

const db = new Pool({
  connectionString: process.env.DB_CONNECTION_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

export interface DelegationPoolPerformance {
  poolAddress: string;
  performance: DelegationEvent[]; // Replace 'any' with the actual type returned by getDelegatorPerformanceByAddress
  realtimePerformance: RealtimeDelegatorPerformance; // Replace 'any' with the actual type returned by getRealtimeDelegatorPerformance
}

const getDelegationPoolsByDelegatorAddress = async (
  delegatorAddress: string
): Promise<DelegationPoolPerformance[]> => {
  if (!process.env.DB_CONNECTION_URI) return Error("Missing DB_CONNECTION_URI");

  try {
    // Connect to the database
    console.log("Connecting");
    const client = await db.connect();
    // Perform a query
    const result = await client.query(
      `SELECT * FROM delegation_pool.delegation_pool_events WHERE delegator_address = $1`,
      [delegatorAddress]
    );
    // Extract unique pool addresses
    const uniquePoolAddressesSet = new Set<string>();
    for (const row of result.rows) {
      uniquePoolAddressesSet.add(row.pool_address);
    }
    const uniquePoolAddresses = Array.from(uniquePoolAddressesSet);

    // Call getDelegatorPerformanceByAddress and getRealtimeDelegatorPerformance for each uniquePoolAddress
    const performancePromises = uniquePoolAddresses.map(async (poolAddress) => {
      const performance = await getDelegatorPerformanceByAddress(
        poolAddress,
        delegatorAddress
      );
      const realtimePerformance = await getRealtimeDelegatorPerformance(
        poolAddress,
        delegatorAddress
      );
      return {
        poolAddress,
        performance,
        realtimePerformance,
      };
    });

    const performanceResults = await Promise.all(performancePromises);

    return performanceResults;
  } catch (err) {
    console.error("Database query error", err);
    throw err;
  }
  // List delegator events here
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("CALLED");
  // Extract delegatorAddress from the query parameters
  const delegatorAddress = req.query.delegatorAddress as string;

  // Check if delegatorAddress are provided
  if (!delegatorAddress) {
    return res.status(400).json({ error: "Missing delegator address" });
  }

  try {
    const data = await getDelegationPoolsByDelegatorAddress(delegatorAddress);
    console.log("Data", data);
    // If rows is empty but no error was thrown, it could mean no data was found
    if (!data?.length) {
      return res
        .status(404)
        .json({ error: "No data found for the given delegator address" });
    }

    res.status(200).json(data);
  } catch (error) {
    // Log the error for server-side debugging
    console.error("Error in getDelegationPoolsByDelegatorAddress:", error);

    // Respond with a 500 Internal Server Error status code and an error message
    res.status(500).json({
      error:
        "An error occurred while fetching the getDelegationPoolsByDelegatorAddress data.",
    });
  }
}
