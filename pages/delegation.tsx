import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Button,
  Heading,
  Stack,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";
import { useEffect, useMemo, useState } from "react";

import WalletModal from "../components/ConnectWalletModal";
import { formatAptos, formatAptosBigNumber } from "../utils";
import { DelegationPoolPerformance } from "./api/getDelegationPoolsByAddress";
import { DelegationEvent } from "./api/getDelegatorPerformanceByAddress";
import { RealtimeDelegatorPerformance } from "./api/getRealtimeDelegatorPerformance";

enum StakeEvents {
  AddStakeEvent = "AddStakeEvent",
  WithdrawStakeEvent = "WithdrawStakeEvent",
  UnlockStakeEvent = "UnlockStakeEvent",
  ReactivateStakeEvent = "ReactivateStakeEvent",
}
const eventTypeToAmountKey: Record<string, string> = {
  [StakeEvents.AddStakeEvent]: "amount_added",
  [StakeEvents.WithdrawStakeEvent]: "amount_withdrawn",
  [StakeEvents.UnlockStakeEvent]: "amount_unlocked",
  [StakeEvents.ReactivateStakeEvent]: "amount_reactivated",
};

const getEventTypeDisplayName = (eventType: string) => {
  switch (eventType) {
    case "AddStakeEvent":
      return "Add Stake";
    case "WithdrawStakeEvent":
      return "Withdraw Stake";
    case "UnlockStakeEvent":
      return "Unlock Stake";
    case "ReactivateStakeEvent":
      return "Reactivate Stake";
    default:
      return eventType; // Return the eventType as is if it doesn't match
  }
};

function getFirstExistingEventValue(
  eventType: string,
  event: DelegationEvent
): string {
  let amountKey = eventTypeToAmountKey[eventType] as keyof DelegationEvent;

  return formatAptos(event[amountKey] ?? "0", 2);

  return "N/A"; // or any other default value you want to return if none of the keys exist
}

// DOCUMENTATION https://github.com/aptos-labs/aptos-core/blob/d20fab97b7311cf04fe65cb8226debf9b2a0bdc4/aptos-move/framework/aptos-framework/doc/delegation_pool.md#0x1_delegation_pool_get_stake
export const getServerSideProps: GetServerSideProps<
  | {
      delegator: string;
      data: DelegationPoolPerformance[];
    }
  | { error: string }
> = async (context) => {
  if (!context.query.delegator)
    return { props: { error: "Missing delegator or pool address" } };
  const delegator = context.query.delegator as string;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/getDelegationPoolsByAddress?delegatorAddress=${delegator}`,
    {
      method: "GET",
    }
  );
  const data: DelegationPoolPerformance[] = await response.json();

  return {
    props: {
      delegator,
      data,
    },
  };
};

const aptosConfig = new AptosConfig({
  fullnode: process.env.API_URL_MAINNET,
});
const aptos = new Aptos(aptosConfig);
const Home = ({
  data,
  delegator,
  error,
}: {
  data: DelegationPoolPerformance[];
  delegator: string;
  error?: string;
}) => {
  const [address, setAddress] = useState<string>(delegator);
  console.log("address", address);
  const router = useRouter();
  const updateDelegatorQueryParam = (newDelegator: string) => {
    // This will replace the current URL with the new query parameter
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, delegator: newDelegator },
      },
      undefined,
      { shallow: true }
    );
  };
  const { account, disconnect, wallet, wallets, signAndSubmitTransaction } =
    useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [delegationData, setDelegationData] =
    useState<DelegationPoolPerformance[]>(data);

  // set primary address to connected wallet
  useEffect(() => {
    if (account?.address) {
      console.log("Setting address to connected wallet", account.address);
      setAddress(account?.address);
    }
  }, [account]);

  useEffect(() => {
    if (address !== router.query.delegator) {
      setAddress(address);
      updateDelegatorQueryParam(address);
    }
  }, [address, router.query.delegator]);

  useEffect(() => {
    if (address) {
      fetchData(address);
    }
  }, [address]);

  // set master address, prioritize connected wallet, change query param

  useEffect(() => {
    console.log("Account", account?.address, delegator);
    if (!account?.address && !address && !delegator) {
      onOpen(); // Open connect wallet modal
    } else {
      onClose();
    }
  }, [account, address, onOpen]);

  const fetchData = async (delegatorAddress: string) => {
    try {
      // Using dave's address for testing
      // delegatorAddress =
      //   "0x17d78b53adf57b8653bd3035724b2a4ce6b8d0222ff9d2d58eebfcd3a9bd6c25";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getDelegationPoolsByAddress?delegatorAddress=${delegatorAddress}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setDelegationData(data);
      console.log("Data~~~", data);
    } catch (e) {
      console.error(e);
    }

    // Use the data as needed
  };

  const stakingHistoryTableData = useMemo(() => {
    if (!delegationData?.length) return [];
    return delegationData?.flatMap((delegation) =>
      delegation.performance.map((event) => ({
        poolAddressShort: `0x${event.pool_address.slice(
          2,
          5
        )}...${event.pool_address.slice(-3)}`,
        eventTypeDisplay: getEventTypeDisplayName(event.event_type),
        eventAmount: getFirstExistingEventValue(event.event_type, event),
        eventDate: dayjs(event.transaction_timestamp).format("M/D/YY hh:mm A"),
      }))
    );
  }, [delegationData]);

  const delegate = async () => {
    console.log("DELEGATING from ", account);
    if (!account?.address) return console.error("Connect wallet");
    const response = await signAndSubmitTransaction({
      data: {
        function: "0x1::delegation_pool::add_stake",
        // typeArguments: ["0x1::aptos_coin::AptosCoin"],
        // [poolAddress, amount in 10^8]
        functionArguments: [
          "0x9bfd93ebaa1efd65515642942a607eeca53a0188c04c21ced646d2f0b9f551e8",
          1000000,
        ],
      },
    });
    try {
      await aptos.waitForTransaction({ transactionHash: response.hash });
    } catch (error) {
      console.error("error signing", error);
    }
  };
  // Calculations from server side props
  const stakingSummary = useMemo(() => {
    let totalAdded = new BigNumber(0);
    let totalWithdrawn = new BigNumber(0);
    let currentStake = new BigNumber(0);
    let pendingWithdrawal = new BigNumber(0);

    delegationData?.length &&
      delegationData?.forEach((delegation) => {
        delegation.performance.forEach((event) => {
          if (event.event_type === StakeEvents.AddStakeEvent) {
            totalAdded = totalAdded.plus(new BigNumber(event.amount_added));
          } else if (event.event_type === StakeEvents.WithdrawStakeEvent) {
            totalWithdrawn = totalWithdrawn.plus(
              new BigNumber(event.amount_withdrawn)
            );
          }
        });
        currentStake = currentStake.plus(
          new BigNumber(delegation.realtimePerformance.activeStake)
        );
        pendingWithdrawal = pendingWithdrawal.plus(
          new BigNumber(delegation.realtimePerformance.pendingWithdrawAmount)
        );
      });

    const netStake = currentStake.minus(totalAdded).plus(totalWithdrawn);
    const percentageReturned = totalAdded.isZero()
      ? new BigNumber(0)
      : netStake.dividedBy(totalAdded).multipliedBy(100);

    return {
      totalAdded,
      totalWithdrawn,
      currentStake,
      pendingWithdrawal,
      netStake,
      percentageReturned,
    };
  }, [delegationData]);
  return (
    <>
      <Head>
        <title>Stake Aptos</title>
        <meta name="description" content="StakeAptos Staking Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WalletModal
        isOpen={isOpen}
        onClose={onClose}
        address={address}
        setAddress={setAddress}
      />
      <Heading
        color="black"
        fontSize={["3xl", "3xl", "5xl"]}
        lineHeight={["9", "9", "10"]}
        fontWeight="bold"
        mb={["6", "10"]}
      >
        Aptos Delegation Dashboard
      </Heading>
      <p>Master address: {address}</p>
      <Button onClick={onOpen}>Connect Wallet</Button>
      <StatGroup mb={8}>
        <Stat>
          <StatLabel>Your Total Stake</StatLabel>
          <StatNumber>
            {formatAptosBigNumber(stakingSummary.currentStake, 2)} APT
          </StatNumber>
          <StatHelpText>Incl. Restaked</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Total Return</StatLabel>
          <StatNumber>
            {formatAptosBigNumber(stakingSummary.netStake, 2)} APT
          </StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            {stakingSummary.percentageReturned.isNaN()
              ? "N/A"
              : `${stakingSummary.percentageReturned.toFixed(2)}%`}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Network APY</StatLabel>
          <StatNumber>7.25%</StatNumber>
        </Stat>
      </StatGroup>
      <StatGroup mb={12}>
        <Stat>
          <StatLabel>Cumm. Delegated</StatLabel>
          <StatNumber>
            {formatAptosBigNumber(stakingSummary.totalAdded, 2)} APT
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Cumm. Undelegated</StatLabel>
          <StatNumber>
            {formatAptosBigNumber(stakingSummary.totalWithdrawn, 2)} APT
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Cumm. Withdrawable</StatLabel>
          <StatNumber>
            {formatAptosBigNumber(stakingSummary.pendingWithdrawal, 2)} APT
          </StatNumber>
        </Stat>
      </StatGroup>
      {/* All the user's delegations */}
      <TableContainer>
        <Heading as="h3" fontSize={"2xl"}>
          Your Delegations
        </Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Staking Pool</Th>
              <Th>Current Stake</Th>
              <Th>Unlock Date</Th>
              <Th>Staked on</Th>
              <Th>Manage</Th>
            </Tr>
          </Thead>
          <Tbody>
            {delegationData?.length &&
              delegationData?.map((delegation, index) => {
                return (
                  <Tr key={index}>
                    {/* <Td>{event.sequence_number}</Td> */}
                    {/* <Td>{event.creation_number}</Td> */}
                    <Td>{`0x${delegation.poolAddress.slice(
                      2,
                      5
                    )}...${delegation.poolAddress.slice(-3)}`}</Td>
                    {/* <Td>{`0x${event.delegator_address.slice(2, 5)}...${event.delegator_address.slice(-3)}`}</Td> */}
                    <Td>
                      {formatAptosBigNumber(
                        BigNumber(delegation.realtimePerformance.activeStake),
                        2
                      )}
                    </Td>
                    <Td>dd/mm/yyyy</Td>
                    {/* <Td>{formatAptos(event.transaction_version)}</Td> */}
                    <Td>
                      {dayjs(
                        delegation.performance
                          .filter((event) => event.transaction_timestamp)
                          .reduce((earliest, current) =>
                            dayjs(earliest.transaction_timestamp).isAfter(
                              dayjs(current.transaction_timestamp)
                            )
                              ? current
                              : earliest
                          ).transaction_timestamp
                      ).format("M/D/YY hh:mm A")}
                    </Td>
                    <Td>
                      <Button
                        colorScheme={"blue"}
                        color="white"
                        mr={2}
                        onClick={() => delegate()}
                      >
                        Delegate more
                      </Button>
                      <Button colorScheme={"red"} color="white">
                        Undelegate
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
          </Tbody>
        </Table>
      </TableContainer>
      <TableContainer>
        <Heading as="h3" fontSize={"2xl"}>
          Staking History
        </Heading>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Staking Pool</Th>
              <Th>Action</Th>
              <Th>Amount</Th>
              <Th>Date</Th>
              <Th>Manage</Th>
            </Tr>
          </Thead>
          <Tbody>
            {stakingHistoryTableData?.map((data, index) => (
              <Tr key={index}>
                <Td>{data.poolAddressShort}</Td>
                <Td>{data.eventTypeDisplay}</Td>
                <Td>{data.eventAmount}</Td>
                <Td>{data.eventDate}</Td>
                <Td>
                  <Button colorScheme={"gray"}>View</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default Home;
