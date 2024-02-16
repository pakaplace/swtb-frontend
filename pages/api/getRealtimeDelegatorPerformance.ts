import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
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

type FunctionName = `${string}::${string}::${string}`;

export const getRealtimeDelegatorPerformance = async (
  pool_address: string,
  delegator_address: string
): Promise<RealtimeDelegatorPerformance> => {
  const aptosConfig = new AptosConfig({
    fullnode: process.env.API_URL_MAINNET,
  });
  const aptos = new Aptos(aptosConfig);
  const getStakePayload = {
    function: "0x1::delegation_pool::get_stake" as FunctionName,
    functionArguments: [pool_address, delegator_address],
  };
  // Returns has withdrawal boolean, withdrawalable stake
  const getPendingWithdrawalPayload = {
    function: "0x1::delegation_pool::get_pending_withdrawal" as FunctionName,
    functionArguments: [pool_address, delegator_address],
  };

  const getObservedLockupCyclePayload = {
    function: "0x1::delegation_pool::observed_lockup_cycle" as FunctionName,
    functionArguments: [pool_address],
  };

  const getOperatorCommissionPercentagePayload = {
    function:
      "0x1::delegation_pool::operator_commission_percentage" as FunctionName,
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
  console.log(
    "Returns active, inactive, pending inactive stake",
    getStakeResult
  );
  return {
    activeStake: getStakeResult[0] as string,
    inactiveStake: getStakeResult[1] as string,
    pendingActiveStake: getStakeResult[2] as string,
    pendingInactiveStake: getStakeResult[2] as string,
    pendingWithdrawAmount: getPendingWidthdrawalResult[1] as string,
    lockupCycle: getObservedLockupCycle[0] as string,
    operatorCommission: getOperatorCommissionPercentage[0] as string,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const pool_address = req.query.pool_address as string;
    const delegator_address = req.query.delegator_address as string;

    // Validate the input addresses
    if (!pool_address || !delegator_address) {
      return res.status(400).json({ error: "Invalid request parameters." });
    }

    const result = await getRealtimeDelegatorPerformance(
      pool_address,
      delegator_address
    );
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
