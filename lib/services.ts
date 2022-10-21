export const getAccountResource = async (
  address: string,
  resourceType: string
) => {
  const res = await fetch(
    `${process.env.API_URL}/accounts/${address}/resource/${resourceType}`
  );
  return await res.json();
};
export const getAccountResources = async (address: string) => {
  const res = await fetch(
    `${process.env.API_URL}/accounts/${address}/resources`
  );
  return await res.json();
};

export const getAccountEvents = async (
  address: string,
  structTag: string,
  fieldName: string,
  start?: number,
  limit?: number
) => {
  const res = await fetch(
    `${
      process.env.API_URL
    }/accounts/${address}/events/${structTag}/${fieldName}?${
      typeof start !== "undefined" ? "&start=" + start : ""
    }${typeof limit !== "undefined" ? "&limit=" + limit : ""}`
  );
  return await res.json();
};

export enum Resource {
  StakePool = "0x1::stake::StakePool",
  StakingContract = "0x1::staking_contract::Store",
  ValidatorConfig = "0x1::stake::ValidatorConfig",
  AptosCoin = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
  StakingConfig = "0x1::staking_config::StakingConfig",
}

export enum AptosCoinEvents {
  deposit = "deposit_events",
  withdraw = "withdraw_events",
}
// {{API_URL}}accounts/{{POOL_ADDRESS}}/resource/0x1::stake::StakePool
export enum StakePoolEvents {
  add_stake = "add_stake_events",
  distribute_rewards = "distribute_rewards_events",
  join_validator_set = "join_validator_set_events",
  leave_validator_set = "leave_validator_set_events",
  increase_lockup = "increase_lockup_events",
  initialize_validator = "initialize_validator_events",
  reactivate_stake = "reactivate_stake_events",
  rotate_consensus_key = "rotate_consensus_key_events",
  set_operator = "set_operator_events",
  unlock_stake = "unlock_stake_events",
  update_network_and_fullnode_addresses = "update_network_and_fullnode_addresses_events",
  withdraw_stake = "withdraw_stake_events",
}

// {{API_URL}}accounts/{{POOL_OWNER_ADDRESS}}/resource/0x1::staking_contract::Store
export enum StakingContractEvents {
  add_distribution = "add_distribution_events",
  add_stake = "add_stake_events",
  create_staking_contract = "create_staking_contract_events",
  distribute = "distribute_events",
  request_commission = "request_commission_events",
  reset_lockup = "reset_lockup_events",
  switch_operator = "switch_operator_events",
  unlock_stake = "unlock_stake_events",
  update_voter = "update_voter_events",
}
