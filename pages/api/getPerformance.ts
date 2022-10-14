// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // variables from rust api
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

  // variables added by parker

  const poolAddress =
    req.query.poolAddress ||
    "9da88926fd4d773fd499fc41830a82fe9c9ff3508435e7a16b2d8f529e77cdda";
  const poolOwner =
    req.query.poolOwner ||
    "ccc221485ee530f3981f4beca12f010d2e7bb38d3fe30bfcf7798d99f4aabb33";

  const directStakingPoolRes = await (
    await fetch(
      `${process.env.API_URL}/
accounts/${poolAddress}/resource/0x1::stake::StakePool`,
      { method: "GET" }
    )
  ).json();
  const managedStakingPoolsRes = await (
    await fetch(
      `${process.env.API_URL}/
accounts/${poolOwner}/resource/0x1::staking_contract::Store`,
      { method: "GET" }
    )
  ).json();
  state = !!directStakingPoolRes?.data?.active ? "Active" : "Not Active";
  operator_address = !!directStakingPoolRes?.data?.operator_address;
  voter_address = !!directStakingPoolRes?.data?.voter_address;
  total_stake = directStakingPoolRes?.data?.active.value;
  lockup_expiration_utc_time = dayjs.unix(
    directStakingPoolRes?.data?.locked_until_secs
  );
  const resData = {
    directPool: {
      state: !!directStakingPoolRes?.data?.active,
      operator_address: !!directStakingPoolRes?.data?.operator_address,
      voter_address: !!directStakingPoolRes?.data?.voter_address,
      total_stake: directStakingPoolRes?.data?.active.value,
      lockup_expiration_utc_time: dayjs
        .unix(directStakingPoolRes?.data?.locked_until_secs)
        .toDate(),
    },
    managedPools: [],
  };
  // console.log(managedStakingPoolsRes.data.staking_contracts);
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
    const daysSinceStart = dayjs().diff(dayjs("2022-10-12"));
    const apr = totalRewardsBN
      .dividedBy(principal)
      .multipliedBy(BigNumber(daysSinceStart))
      .dividedBy(BigNumber(365.25));
    console.log(managedStakingPools[i].value, apr.toString());
    resData.managedPools.push({
      pool_address: managedStakingPools[i].value.pool_address,
      commission_percentage,
      commission_not_yet_unlocked: unlockedCommissionBN.toString(),
      total_rewards: totalRewardsBN.toString(),
      apr,
    });
  }
  console.log("ResData", resData);
  res.status(200).json(resData);
}
