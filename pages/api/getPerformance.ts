// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { getAccountEvents, getAccountResource } from "../../lib/services";
const CORE_CODE_ADDRESS = "0x1";

type ResponseData = {
  epoch: number;
  epoch_interval_secs: number;
  current_epoch_start_time: number;
  next_epoch_start_time: number;
  current_epoch_successful_proposals: number;
  current_epoch_failed_proposals: number;
  previous_epoch_rewards: string[];
  validator_index: number;
  pool: {
    state: boolean;
    operator_address: string;
    voter_address: string;
    total_stake: string;
    lockup_expiration_utc_time: Date;
  };
  managedPools: any[];
  validatorConfig: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  let pool = req.query.pool as string;
  if (pool.indexOf("0x") < 0) pool = "0x" + pool;
  let owner = req.query.owner as string;
  if (owner.indexOf("0x") < 0) owner = "0x" + owner;

  // variables from aptos cli / move contracts
  let state;
  let operator_address;
  let voter_address;
  let total_stake;
  let principal;
  // let pool_type;
  // let commission_percentage;
  let commission_not_yet_unlocked;
  let lockup_expiration_utc_time;
  let consensus_public_key;
  let validator_network_addresses;
  let fullnode_network_addresses;
  let epoch_info;
  let vesting_contract;
  let current_epoch_successful_proposals;
  let current_epoch_failed_proposals;
  // variables added by parker

  // const pool: string =
  //   "0x9da88926fd4d773fd499fc41830a82fe9c9ff3508435e7a16b2d8f529e77cdda";
  // const owner =
  //   "0xccc221485ee530f3981f4beca12f010d2e7bb38d3fe30bfcf7798d99f4aabb33";
  const block_resource = await getAccountResource(
    CORE_CODE_ADDRESS,
    "0x1::block::BlockResource"
  );
  const reconfig_resource = await getAccountResource(
    CORE_CODE_ADDRESS,
    "0x1::reconfiguration::Configuration"
  );
  let epoch = Number(reconfig_resource.data.epoch);
  let epoch_interval_secs = Number(block_resource.data.epoch_interval);
  let current_epoch_start_time = Number(
    reconfig_resource.data.last_reconfiguration_time
  );
  let next_epoch_start_time = current_epoch_start_time + epoch_interval_secs;

  const validatorSet = await getAccountResource(
    CORE_CODE_ADDRESS,
    "0x1::stake::ValidatorSet"
  );
  const validatorPerformances = await getAccountResource(
    CORE_CODE_ADDRESS,
    "0x1::stake::ValidatorPerformance"
  );

  const validator = validatorSet.data.active_validators.find(
    (validator: any) => validator.addr === pool
  );
  if (!validator) return console.error("validator not found");
  const validator_index = Number(validator.config.validator_index);
  const currentEpochPerformance =
    validatorPerformances.data.validators[validator_index];
  current_epoch_successful_proposals = Number(
    currentEpochPerformance["successful_proposals"]
  );
  current_epoch_failed_proposals = Number(
    currentEpochPerformance["failed_proposals"]
  );
  let events = await getAccountEvents(
    pool,
    "0x1::stake::StakePool",
    "distribute_rewards_events",
    10,
    1000
  );
  let previous_epoch_rewards = events.map((event: any) => {
    return event.data.rewards_amount;
  });
  const validatorConfigRes = await getAccountResource(
    pool,
    "0x1::stake::ValidatorConfig"
  );
  const validatorRes = await getAccountResource(pool, `0x1::stake::StakePool`);
  const managedStakingPoolsRes = await getAccountResource(
    owner,
    `0x1::staking_contract::Store`
  );
  state = !!validatorRes?.data?.active ? "Active" : "Not Active";
  operator_address = !!validatorRes?.data?.operator_address;
  voter_address = !!validatorRes?.data?.voter_address;
  total_stake = validatorRes?.data?.active.value;
  lockup_expiration_utc_time = dayjs.unix(
    validatorRes?.data?.locked_until_secs
  );
  let resData: ResponseData = {
    epoch,
    epoch_interval_secs,
    current_epoch_start_time,
    next_epoch_start_time,
    current_epoch_successful_proposals,
    current_epoch_failed_proposals,
    previous_epoch_rewards,
    validator_index,
    pool: {
      state: !!validatorRes?.data?.active,
      operator_address: validatorRes?.data?.operator_address,
      voter_address: validatorRes?.data?.voter_address,
      total_stake: validatorRes?.data?.active.value,
      lockup_expiration_utc_time: dayjs
        .unix(validatorRes?.data?.locked_until_secs)
        .toDate(),
    },
    managedPools: [],
    validatorConfig: { ...validatorConfigRes },
  };
  const managedStakingPools =
    managedStakingPoolsRes.data.staking_contracts.data;
  for (let i = 0; i < managedStakingPools.length; i++) {
    // managedStakingPools[i].key
    const commission_percentage = Number(
      managedStakingPools[i].value.commission_percentage
    );
    const principal = managedStakingPools[i].value.principal;
    const totalRewardsBN = BigNumber(total_stake).minus(BigNumber(principal));
    const unlockedCommissionBN = totalRewardsBN.multipliedBy(
      BigNumber(commission_percentage).dividedBy(BigNumber(100))
    );

    const daysSinceStart = dayjs().diff(dayjs("2022-10-13"), "day", true);
    const commissionPerDayBN = unlockedCommissionBN.dividedBy(
      BigNumber(daysSinceStart)
    );
    const rewardsPerDayBN = totalRewardsBN.dividedBy(BigNumber(daysSinceStart));
    const apr = rewardsPerDayBN
      .multipliedBy(BigNumber(365.25))
      .dividedBy(principal)
      .multipliedBy(BigNumber(100));

    resData.managedPools.push({
      pool_address: managedStakingPools[i].value.pool_address,
      commission_percentage,
      commission_not_yet_unlocked: unlockedCommissionBN.toString(),
      total_rewards: totalRewardsBN.toString(),
      apr: apr.toNumber(),
      rewardsPerDay: rewardsPerDayBN.toString(),
      commissionPerDay: commissionPerDayBN.toString(),
      principal,
    });
  }
  res.status(200).json(resData);
}
