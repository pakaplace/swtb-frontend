// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";

import {
  AptosCoinEvents,
  Resource,
  StakePoolEvents,
  StakingContractEvents,
  getAccountEvents,
  getAccountResource,
} from "../../lib/services";

const CORE_CODE_ADDRESS = "0x1";

export type RequestCommissionEvent = {
  accumulated_rewards: string;
  commission_amount: string;
  operator: string;
  pool_address: string;
};
export type AddStakeEvent = {
  amount_added: string;
  pool_address: string;
};
export type WithdrawStakeEvent = {
  amount_withdrawn: string;
  pool_address: string;
};

export type StakingConfig = {
  allow_validator_set_change: boolean;
  maximum_stake: string;
  minimum_stake: string;
  recurring_lockup_duration_secs: string;
  rewards_rate: string;
  rewards_rate_denominator: string;
  voting_power_increase_limit: string;
};

type ResponseData = {
  epoch: number;
  epoch_interval_secs: number;
  current_epoch_start_time: number;
  next_epoch_start_time: number;
  current_epoch_successful_proposals: number;
  current_epoch_failed_proposals: number;
  previous_epoch_rewards: string[];
  validator_index: number;
  stakingConfig: StakingConfig;
  requestCommissionEvents: RequestCommissionEvent[];
  addStakeEvents: AddStakeEvent[];
  withdrawStakeEvents: WithdrawStakeEvent[];
  accumulatedRewards: string;
  accumulatedCommissions: string;
  pool: {
    pendingInactive: string;
    pendingActive: string;
    state: boolean;
    operator_address: string;
    voter_address: string;
    pending_inactive: string;
    total_stake: string;
    initialPrincipal: string;
    lockup_expiration_utc_time: Date;
    current_rewards: string;
  };
  managedPools: any[];
  validatorConfig: any;
};
type ResponseError = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | ResponseError>
) {
  let pool = req.query.pool as string;
  let network = req.query.network as string;
  const RPC_URL =
    network === "previewnet"
      ? process.env.API_URL_PREVIEWNET
      : process.env.API_URL_MAINNET;
  if (!RPC_URL) {
    return res
      .status(500)
      .json({ error: "Missing RPC URL. Contact pleeplace@gmail.com" });
  }
  if (pool.indexOf("0x") < 0) pool = "0x" + pool;
  let owner = req.query.owner as string;
  if (owner.indexOf("0x") < 0) owner = "0x" + owner;

  // variables from aptos cli / move contracts
  let state;
  let operator_address;
  let voter_address;
  let total_stake;
  let pending_inactive;
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
  let previous_epoch_rewards;
  // variables added by parker

  // const pool: string =
  //   "0x9da88926fd4d773fd499fc41830a82fe9c9ff3508435e7a16b2d8f529e77cdda";
  // const owner =
  //   "0xccc221485ee530f3981f4beca12f010d2e7bb38d3fe30bfcf7798d99f4aabb33";
  const [block_resource, reconfig_resource] = await Promise.all([
    getAccountResource(RPC_URL, CORE_CODE_ADDRESS, "0x1::block::BlockResource"),
    getAccountResource(
      RPC_URL,
      CORE_CODE_ADDRESS,
      "0x1::reconfiguration::Configuration"
    ),
  ]);
  let epoch = Number(reconfig_resource.data.epoch);
  let epoch_interval_secs = Number(block_resource.data.epoch_interval);
  let current_epoch_start_time = Number(
    reconfig_resource.data.last_reconfiguration_time
  );
  console.log("reconfig", reconfig_resource.data.last_reconfiguration_time);
  let next_epoch_start_time = current_epoch_start_time + epoch_interval_secs;

  const [validatorSet, validatorPerformances] = await Promise.all([
    getAccountResource(RPC_URL, CORE_CODE_ADDRESS, "0x1::stake::ValidatorSet"),
    getAccountResource(
      RPC_URL,
      CORE_CODE_ADDRESS,
      "0x1::stake::ValidatorPerformance"
    ),
  ]);
  const validator = validatorSet.data.active_validators.find(
    (validator: any) => validator.addr === pool
  );
  if (!validator) {
    return res.status(500).json({
      error:
        "Validator not found at that address. Check your selected nework and address",
    });
  }

  const validator_index = Number(validator.config.validator_index);
  const currentEpochPerformance =
    validatorPerformances.data.validators[validator_index];
  current_epoch_successful_proposals = Number(
    currentEpochPerformance["successful_proposals"]
  );
  current_epoch_failed_proposals = Number(
    currentEpochPerformance["failed_proposals"]
  );

  const [
    distribute_rewards_events,
    validatorConfigRes,
    stakingConfigRes,
    stakePoolRes,
    managedStakingPoolRes,
    add_stake_events,
    withdraw_stake_events,
    withdraw_events,
    deposit_events,
    request_commission_events,
  ] = await Promise.all([
    getAccountEvents(
      RPC_URL,
      pool,
      Resource.StakePool,
      StakePoolEvents.distribute_rewards,
      undefined,
      100
    ),
    getAccountResource(RPC_URL, pool, Resource.ValidatorConfig),
    getAccountResource(RPC_URL, "0x1", Resource.StakingConfig),
    getAccountResource(RPC_URL, pool, Resource.StakePool),
    getAccountResource(RPC_URL, owner, Resource.StakingContract),
    getAccountEvents(
      RPC_URL,
      pool,
      Resource.StakePool,
      StakePoolEvents.add_stake
    ),
    getAccountEvents(
      RPC_URL,
      pool,
      Resource.StakePool,
      StakePoolEvents.withdraw_stake
    ),
    getAccountEvents(
      RPC_URL,
      pool,
      Resource.AptosCoin,
      AptosCoinEvents.withdraw
    ),
    getAccountEvents(
      RPC_URL,
      pool,
      Resource.AptosCoin,
      AptosCoinEvents.deposit
    ),
    getAccountEvents(
      RPC_URL,
      owner,
      Resource.StakingContract,
      StakingContractEvents.request_commission
    ),
  ]);
  const stakingConfig: StakingConfig = stakingConfigRes.data;
  const addStakeEvents = add_stake_events.map((event: any) => event.data);
  let initialPrincipal = BigNumber(0);

  addStakeEvents.forEach((event: AddStakeEvent) => {
    initialPrincipal = initialPrincipal.plus(BigNumber(event.amount_added));
  });
  console.log(
    "~~~",
    distribute_rewards_events,
    validatorConfigRes,
    stakingConfigRes,
    stakePoolRes,
    managedStakingPoolRes,
    add_stake_events,
    withdraw_stake_events,
    withdraw_events,
    deposit_events,
    request_commission_events
  );
  console.log("rewards~~", distribute_rewards_events);
  if (distribute_rewards_events?.length) {
    previous_epoch_rewards = distribute_rewards_events
      ?.map((event: any) => {
        return event.data.rewards_amount;
      })
      .reverse();
  }

  // .slice(0, 100);
  let withdrawStakeEvents = withdraw_stake_events
    .map((event: any) => event.data)
    .reverse();
  let requestCommissionEvents: RequestCommissionEvent[] =
    request_commission_events?.length
      ? request_commission_events.map((event: any) => event.data).reverse()
      : [];
  let accumulatedRewards = BigNumber("0");
  let accumulatedCommissions = BigNumber("0");
  requestCommissionEvents.forEach((event: RequestCommissionEvent) => {
    accumulatedRewards = accumulatedRewards.plus(
      BigNumber(event.accumulated_rewards)
    );
    accumulatedCommissions = accumulatedCommissions.plus(
      BigNumber(event.commission_amount)
    );
  });
  state = !!stakePoolRes?.data?.active ? "Active" : "Not Active";
  operator_address = !!stakePoolRes?.data?.operator_address;
  voter_address = !!stakePoolRes?.data?.voter_address;
  total_stake = stakePoolRes?.data?.active.value;
  console.log("stakePoolRes?.data", stakePoolRes?.data?.locked_until_secs);
  lockup_expiration_utc_time = dayjs.unix(
    stakePoolRes?.data?.locked_until_secs
  );
  let pendingActive = stakePoolRes.data.pending_active.value;
  let pendingInactive = stakePoolRes.data.pending_inactive.value;

  const currRewardsBN = BigNumber(total_stake).minus(
    BigNumber(initialPrincipal)
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
    stakingConfig,
    requestCommissionEvents,
    addStakeEvents,
    withdrawStakeEvents,
    accumulatedRewards: accumulatedRewards.toString(),
    accumulatedCommissions: accumulatedCommissions.toString(),
    pool: {
      pendingActive,
      pendingInactive,
      state: !!stakePoolRes?.data?.active,
      operator_address: stakePoolRes?.data?.operator_address,
      voter_address: stakePoolRes?.data?.voter_address,
      pending_inactive: stakePoolRes?.data.pending_inactive,
      initialPrincipal: initialPrincipal.toString(),
      total_stake: stakePoolRes?.data?.active.value,
      lockup_expiration_utc_time: dayjs
        .unix(stakePoolRes?.data?.locked_until_secs)
        .toDate(),
      current_rewards: currRewardsBN.toString(),
    },
    managedPools: [],
    validatorConfig: { ...validatorConfigRes },
  };

  if (managedStakingPoolRes?.data?.staking_contracts.data?.length) {
    const managedStakingPools =
      managedStakingPoolRes?.data?.staking_contracts.data;
    for (let i = 0; i < managedStakingPools.length; i++) {
      // managedStakingPools[i].key
      const commission_percentage = Number(
        managedStakingPools[i].value.commission_percentage
      );
      const principal = managedStakingPools[i].value.principal;
      const currRewardsBN = BigNumber(total_stake).minus(BigNumber(principal));
      const totalRewardsBN = currRewardsBN.plus(accumulatedRewards);
      const unlockedCommissionBN = totalRewardsBN.multipliedBy(
        BigNumber(commission_percentage).dividedBy(BigNumber(100))
      );

      const daysSinceStart = dayjs().diff(dayjs("2022-10-13"), "day", true);
      const commissionPerDayBN = unlockedCommissionBN.dividedBy(
        BigNumber(daysSinceStart)
      );
      const rewardsPerDayBN = totalRewardsBN.dividedBy(
        BigNumber(daysSinceStart)
      );
      const apr = rewardsPerDayBN
        .multipliedBy(BigNumber(365.25))
        .dividedBy(principal)
        .multipliedBy(BigNumber(100));
      const unrequestedCommissions: string = unlockedCommissionBN
        .minus(BigNumber(accumulatedCommissions))
        .toString();
      resData.managedPools.push({
        pool_address: managedStakingPools[i].value.pool_address,
        commission_percentage,
        commission_not_yet_unlocked: unlockedCommissionBN.toString(),
        unrequestedCommissions,
        total_rewards: totalRewardsBN.toString(),
        currRewards: currRewardsBN.toString(),
        apr: apr.toNumber(),
        rewardsPerDay: rewardsPerDayBN.toString(),
        commissionPerDay: commissionPerDayBN.toString(),
        principal,
      });
    }
  }
  res.status(200).json(resData);
}
