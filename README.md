## API Spec

https://fullnode.mainnet.aptoslabs.com/v1/spec#/

https://aptos-labs.github.io/ts-sdk-doc/

https://mainnet.aptoslabs.com/v1/accounts/0xccc221485ee530f3981f4beca12f010d2e7bb38d3fe30bfcf7798d99f4aabb33/resources

Order:
get_stake_pools
get_stake_pool_info
get_staking_contract_pools
get_staking_contract_pools
request_commission

0x1 = CORE_CODE_ADDRESS

Aptos Voter Address 8ac6fe79b3656feda6485fcf872e00033dd35cd9d8e10b485e3dee34949b2f47
Aptos managed staking pool address: 9da88926fd4d773fd499fc41830a82fe9c9ff3508435e7a16b2d8f529e77cdda
Aptos foundation owner address: ccc221485ee530f3981f4beca12f010d2e7bb38d3fe30bfcf7798d99f4aabb33
SWTB Owner/Operator Address (What aptos delegates to): b28cb7ccfa1d6d9854d85d69f4ffda2f81dca007ff96509805b4f69b011e9453
SWTB Voter address: b28cb7ccfa1d6d9854d85d69f4ffda2f81dca007ff96509805b4f69b011e9453

aptos node get-performance \ --pool-address 9da88926fd4d773fd499fc41830a82fe9c9ff3508435e7a16b2d8f529e77cdda \ --url https://fullnode.mainnet.aptoslabs.com/v1

./aptos node get-performance \
--pool-address 9da88926fd4d773fd499fc41830a82fe9c9ff3508435e7a16b2d8f529e77cdda \
--url https://fullnode.mainnet.aptoslabs.com/v1

./aptos node get-stake-pool --owner-address 0xccc221485ee530f3981f4beca12f010d2e7bb38d3fe30bfcf7798d99f4aabb33 --url https://fullnode.mainnet.aptoslabs.com/v1

Stake.move - join validator set as a node operator
https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-framework/sources/stake.move

Staking_contract.move - stakers create pools and set operators
https://github.com/aptos-labs/aptos-core/blob/main/aptos-move/framework/aptos-framework/sources/staking_contract.move

aptos stake request-commission \
 --operator-address 0x3bec5a529b023449dfc86e9a6b5b51bf75cec4a62bf21c15bbbef08a75f7038f \
 --owner-address 0xe7be097a90c18f6bdd53efe0e74bf34393cac2f0ae941523ea196a47b6859edb \
 --profile mainnet-operator
