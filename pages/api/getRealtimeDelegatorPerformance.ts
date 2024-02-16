// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";

export interface RealtimeDelegatorPerformance {
  activeStake: string;
  inactiveStake: string;
  pendingActiveStake: string;
  pendingInactiveStake: string;
  pendingWithdrawAmount: string;
  lockupCycle: string;
  operatorCommission: string;
}

export const getRealtimeDelegatorPerformance = async (
  pool_address: string,
  delegator_address: string
): Promise<RealtimeDelegatorPerformance> => {
  console.log("realtime~~", pool_address, delegator_address);
  const aptosConfig = new AptosConfig({
    fullnode: process.env.API_URL_MAINNET,
  });
  const aptos = new Aptos(aptosConfig);
  const getStakePayload = {
    function: "0x1::delegation_pool::get_stake",
    functionArguments: [pool_address, delegator_address],
  };
  // Returns has withdrawal boolean, withdrawalable stake
  const getPendingWithdrawalPayload = {
    function: "0x1::delegation_pool::get_pending_withdrawal",
    functionArguments: [pool_address, delegator_address],
  };

  const getObservedLockupCyclePayload = {
    function: "0x1::delegation_pool::observed_lockup_cycle",
    functionArguments: [pool_address],
  };

  const getOperatorCommissionPercentagePayload = {
    function: "0x1::delegation_pool::operator_commission_percentage",
    functionArguments: [pool_address],
  };

  // Returns active, inactive, pending inactive stake
  const getStakeResult = await aptos.view({ payload: getStakePayload });
  // Returns has withdrawal boolean, withdrawal amount number
  const getPendingWidthdrawalResult = await aptos.view({
    payload: getPendingWithdrawalPayload,
  });
  const getObservedLockupCycle = await aptos.view({
    payload: getObservedLockupCyclePayload,
  });
  const getOperatorCommissionPercentage = await aptos.view({
    payload: getOperatorCommissionPercentagePayload,
  });

  return {
    activeStake: getStakeResult[0] as string,
    inactiveStake: getStakeResult[1] as string,
    pendingActiveStake: getStakeResult[2] as string,
    pendingInactiveStake: getStakeResult[3] as string,
    pendingWithdrawAmount: getPendingWidthdrawalResult[1] as string,
    lockupCycle: getObservedLockupCycle[0] as string,
    operatorCommission: getOperatorCommissionPercentage[0] as string,
  };
};

export default async function handler(req: NextApiRequest, res: any) {
  console.log("CALLED~~~");
  let pool_address = req.query.pool_address as string;
  let delegator_address = req.query.delegator_address as string;
  console.log("pool_address", pool_address);
  const result = await getRealtimeDelegatorPerformance(
    pool_address,
    delegator_address
  );
  // console.log("RESULT~", result);
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
