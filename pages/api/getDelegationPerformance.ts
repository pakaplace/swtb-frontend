// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";

const getDelegatorPerformance = async (
  pool_address: string,
  delegator_address: string
) => {
  console.log("AQUI");
  const aptosConfig = new AptosConfig({
    fullnode: process.env.API_URL_MAINNET,
  });
  console.log("variables", pool_address, delegator_address);
  const aptos = new Aptos(aptosConfig);
  const getStakePayload = {
    function: "0x1::delegation_pool::get_stake",
    functionArguments: [pool_address, delegator_address],
  };
  const payloadGetPendingWithdrawal = {
    function: "0x1::delegation_pool::get_pending_withdrawal",
    functionArguments: [pool_address, delegator_address],
  };
  // Returns active, inactive, pending inactive stake
  const getStakeResult = await aptos.view({ payload: getStakePayload });
  // Returns has withdrawal boolean, withdrawal amount number
  const getPendingWidthdrawalResult = await aptos.view({
    payload: payloadGetPendingWithdrawal,
  });
  return { getStakeResult, getPendingWidthdrawalResult };
};

export default async function handler(req: NextApiRequest, res: any) {
  console.log("CALLED~~~");
  let pool_address = req.query.pool_address as string;
  let delegator_address = req.query.delegator_address as string;
  console.log("pool_address", pool_address);
  const result = await getDelegatorPerformance(pool_address, delegator_address);
  console.log("RESULT~", result);
  res.status(200).json(result);
  //   const RPC_URL =
  //     network === "previewnet"
  //       ? process.env.API_URL_PREVIEWNET
  //       : process.env.API_URL_MAINNET;
  //   if (!RPC_URL) {
  //     return res
  //       .status(500)
  //       .json({ error: "Missing RPC URL. Contact pleeplace@gmail.com" });
  //   }

  res.status(200).json({});
}
