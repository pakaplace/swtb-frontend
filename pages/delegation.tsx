import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Adjust the import path if necessary
// Adjust the import path if necessary
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Stack, // Stat,
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
import { DelegateModal } from "../components/DelegateModal";
import { Stat } from "../components/Stat";
import { UndelegateModal } from "../components/UndelegateModal";
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
  fullnode: process.env.NEXT_PUBLIC_API_URL_MAINNET,
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
  const router = useRouter();

  // Add these states to your component
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [delegateAmount, setDelegateAmount] = useState("");
  const [currentPoolAddress, setCurrentPoolAddress] = useState("");
  const [balance, setBalance] = useState<string>("");

  // Function to open the modal and set the current pool address
  const openDelegateModal = (poolAddress: string) => {
    setCurrentPoolAddress(poolAddress);
    setIsDelegateModalOpen(true);
  };

  const openUndelegateModal = (stakedBalance: string, poolAddress: string) => {
    setStakedBalance(stakedBalance);
    setCurrentPoolAddress(poolAddress);
    setIsUndelegateModalOpen(true);
  };
  // Function to handle the delegation submission
  const handleDelegateSubmit = async () => {
    const amountBN = new BigNumber(delegateAmount).shiftedBy(8); // Shift the entered amount by 8 digits to the left
    const balanceBN = new BigNumber(balance);
    if (!amountBN.isNaN() && amountBN.gt(0) && amountBN.lte(balanceBN)) {
      await delegate(amountBN.toNumber(), currentPoolAddress);
      setIsDelegateModalOpen(false); // Close the modal after submission
    } else {
      window.alert("Invalid amount or amount exceeds balance");
      console.error("Invalid amount or amount exceeds balance");
    }
  };

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

  const [isUndelegateModalOpen, setIsUndelegateModalOpen] = useState(false);
  const [undelegateAmount, setUndelegateAmount] = useState("");
  const [stakedBalance, setStakedBalance] = useState<string>("");

  // Function to fetch the balance of an account
  const fetchBalance = async (accountAddress: string) => {
    try {
      const resources = await aptos.getAccountResources({ accountAddress });
      const coinStoreResource = resources.find(
        (resource) =>
          resource.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );
      console.log("Coin store resource~~", coinStoreResource);
      // @ts-ignore
      return coinStoreResource?.data?.coin?.value; // Adjust the path according to the actual resource structure
    } catch (error) {
      console.error("Error fetching balance:", error);
      return null;
    }
  };

  // set primary address to connected wallet
  useEffect(() => {
    if (account?.address) {
      console.log("Setting address to connected wallet", account.address);
      setAddress(account?.address);
      fetchBalance(account.address).then((balance) => {
        console.log("Account balance:", typeof balance);
        setBalance(balance);
      });
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

  const delegate = async (amount: number, poolAddress: string) => {
    console.log("DELEGATING from ", account);
    if (!account?.address) return console.error("Connect wallet");
    const response = await signAndSubmitTransaction({
      data: {
        function: "0x1::delegation_pool::add_stake",
        // typeArguments: ["0x1::aptos_coin::AptosCoin"],
        // [poolAddress, amount in 10^8]
        functionArguments: [poolAddress, amount],
      },
    });
    try {
      await aptos.waitForTransaction({ transactionHash: response.hash });
    } catch (error) {
      console.error("error signing", error);
    }
  };
  const undelegate = async (amount: number, poolAddress: string) => {
    console.log("DELEGATING from ", account);
    if (!account?.address) return console.error("Connect wallet");
    console.log("Amount~~~~~~~~", amount);
    const response = await signAndSubmitTransaction({
      data: {
        function: "0x1::delegation_pool::unlock",
        // typeArguments: ["0x1::aptos_coin::AptosCoin"],
        // [poolAddress, amount in 10^8]
        functionArguments: [poolAddress, amount],
      },
    });
    try {
      await aptos.waitForTransaction({ transactionHash: response.hash });
    } catch (error) {
      console.error("error signing", error);
    }
  };
  const handleUndelegateSubmit = async () => {
    const amountBN = new BigNumber(undelegateAmount).shiftedBy(8); // Shift the entered amount by 8 digits to the left
    console.log("amountBN~~", amountBN.toNumber());
    // ... similar logic to handleDelegateSubmit but for undelegation
    if (
      !amountBN.isNaN() &&
      amountBN.gt(0) &&
      amountBN.lte(new BigNumber(stakedBalance))
    ) {
      await undelegate(amountBN.toNumber(), currentPoolAddress);
      setIsUndelegateModalOpen(false); // Close the modal after submission
    } else {
      console.error("Invalid amount or amount exceeds staked balance");
    }
  };

  // ...

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

      {isDelegateModalOpen && (
        <DelegateModal
          isOpen={isDelegateModalOpen}
          onClose={() => setIsDelegateModalOpen(false)}
          balance={balance}
          delegateAmount={delegateAmount}
          setDelegateAmount={setDelegateAmount}
          handleDelegateSubmit={handleDelegateSubmit}
        />
      )}
      {isUndelegateModalOpen && (
        <UndelegateModal
          isOpen={isUndelegateModalOpen}
          onClose={() => {
            setIsUndelegateModalOpen(false);
          }}
          balance={stakedBalance} // This should be the staked balance, not the total balance
          undelegateAmount={undelegateAmount}
          setUndelegateAmount={setUndelegateAmount}
          handleUndelegateSubmit={handleUndelegateSubmit}
        />
      )}
      <Stack spacing={{ base: "8", lg: "6" }} width="100%">
        <HStack mb={["6", "10"]}>
          <Heading
            color="black"
            fontSize={["3xl", "3xl", "5xl"]}
            lineHeight={["9", "9", "10"]}
            fontWeight="bold"
            mr={4}
          >
            Aptos Delegation Dashboard
          </Heading>
          {!account?.address && (
            <Button bg="#eaf8ff" color="blue.500" onClick={onOpen}>
              Connect Wallet
            </Button>
          )}
        </HStack>

        <SimpleGrid columns={{ base: 2, md: 3 }} mb={10} gap="6">
          <Stat
            label="Your Total Stake"
            value={`${formatAptosBigNumber(
              stakingSummary.currentStake,
              2
            )} APT`}
            bottomLabel="Incl. Restaked"
          />
          <Stat
            label="Total Return"
            value={`${formatAptosBigNumber(stakingSummary.netStake, 2)} APT`}
            delta={{
              value: stakingSummary.percentageReturned.isNaN()
                ? "N/A"
                : `${stakingSummary.percentageReturned.toFixed(2)}%`,
              isUpwardsTrend: true,
            }}
          />

          <Stat label="Network APY" value="7.25%" />
        </SimpleGrid>
        <SimpleGrid columns={{ base: 2, md: 3 }} mb={10} gap="6">
          <Stat
            label="Cumm. Delegated"
            value={`${formatAptosBigNumber(stakingSummary.totalAdded, 2)} APT`}
          />
          <Stat
            label="Cumm. Undelegated"
            value={`${formatAptosBigNumber(
              stakingSummary.totalWithdrawn,
              2
            )} APT`}
          />
          <Stat
            label="Cumm. Withdrawable"
            value={`${formatAptosBigNumber(
              stakingSummary.pendingWithdrawal,
              2
            )} APT`}
          />
        </SimpleGrid>
        {/* All the user's delegations */}
        <TableContainer mt={10}>
          <Heading as="h3" fontSize={"2xl"}>
            Your Stakes
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Staking Pool</Th>
                <Th>Current Stake</Th>
                <Th>Unlock Date</Th>
                <Th>Staked on</Th>
                <Th>Operator commission</Th>
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
                      <Td>3/24/24</Td>
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
                        {`${(delegation?.realtimePerformance?.operatorCommission
                          ? +delegation.realtimePerformance.operatorCommission /
                            100
                          : 0
                        ).toFixed(2)}%`}
                      </Td>
                      <Td>
                        <Button
                          colorScheme={"blue"}
                          color="white"
                          mr={2}
                          onClick={() => {
                            {
                              !account?.address
                                ? onOpen()
                                : openDelegateModal(delegation.poolAddress);
                            }
                          }}
                          // isDisabled={!account?.address}
                        >
                          {!account?.address
                            ? "Connect Wallet"
                            : "Delegate More"}
                        </Button>
                        {account?.address && (
                          <Button
                            colorScheme={"red"}
                            color="white"
                            isDisabled={!account?.address}
                            onClick={() =>
                              openUndelegateModal(
                                delegation.realtimePerformance.activeStake,
                                delegation.poolAddress
                              )
                            }
                          >
                            Undelegate
                          </Button>
                        )}
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
      </Stack>
    </>
  );
};

export default Home;
