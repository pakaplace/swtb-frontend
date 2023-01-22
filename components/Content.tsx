import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  BoxProps,
  Button,
  Divider,
  HStack,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  VStack,
  useBreakpointValue,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableCaption,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import numeral from "numeral";
import * as React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { FiDownloadCloud } from "react-icons/fi";

import {
  AddStakeEvent,
  RequestCommissionEvent,
  WithdrawStakeEvent,
} from "../pages/api/getPerformance";
import CopyableField from "./CopyableField";
import { MyHeading } from "./MyHeading";
import { Stat } from "./Stat";

const formatAptos = (val: string, decimals?: number) =>
  BigNumber(val)
    .shiftedBy(-8)
    .toFormat(decimals ?? 0);

interface ContentProps {
  data: any;
  pool: string;
  owner: string;
}

export const Content = ({ data, pool, owner }: ContentProps) => {
  const {
    connect,
    account,
    network,
    connected,
    disconnect,
    wallet,
    wallets,
    signAndSubmitTransaction,
    signTransaction,
    signMessage,
    signMessageAndVerify,
  } = useWallet();
  const toast = useToast({
    variant: "subtle",
    position: "top",
  });

  const userIsOperator: boolean =
    data.pool.operator_address === account?.address;

  const onSendToParker = async () => {
    const PARKER =
      "0xdaa53cf262b0d298a9fcc4ec8aa94ff5c19708ca14698a3593a049bf58049d16";
    const payload = {
      type: "entry_function_payload",
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [PARKER, 1], // 1 is in Octas
    };

    try {
      const response = await signAndSubmitTransaction(payload);
      toast({
        title: "Transaction success",
        description: "1 APT was successfully transferred to Parker",
        status: "success",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        status: "error",
        title: "Transaction failed",
        description: error,
      });
    }
  };

  const onRequestCommission = async () => {
    const payload = {
      type: "entry_function_payload",
      function: "0x1::staking_contract::request_commission",
      type_arguments: [], // type
      arguments: [owner, data.pool?.operator_address], // account is first arg as &signer
    };

    try {
      const response = await signAndSubmitTransaction(payload);
      console.log(response);
    } catch (error: any) {
      console.log("error", error);
    }
  };

  return (
    <Stack spacing={{ base: "8", lg: "6" }} width="100%">
      <Stack
        spacing="4"
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        width="100%"
      >
        <Stack spacing="1" width="100%">
          <Heading
            size={useBreakpointValue({ base: "sm", lg: "md" })}
            fontWeight="medium"
          >
            Dashboard
          </Heading>
          <Text color="muted">All important metrics at a glance</Text>
        </Stack>

        <Stack direction="row" spacing="3">
          {/* <Button
          variant="secondary"
          leftIcon={<FiDownloadCloud fontSize="1.25rem" />}
        >
          Download
        </Button>
        <Button variant="primary">Create</Button> */}
        </Stack>
      </Stack>

      <Stack spacing={{ base: "5", lg: "6" }}>
        <Box justifyContent={"flex-start"}>
          <MyHeading>Actions</MyHeading>
          <Box
            bg="bg-surface"
            borderRadius="lg"
            boxShadow={useColorModeValue("xs", "xs-dark")}
            padding={3}
            my={3}
            alignItems="start"
          >
            {!connected && (
              <Text size="sm" fontWeight={"book"}>
                Connect your wallet by clicking on "Manage Wallet" in the navbar
                to get started.
              </Text>
            )}
            {connected && (
              <>
                <Box>
                  <Text fontWeight={"bold"}>Operator Address:</Text>
                  <CopyableField content={data.pool.operator_address} />
                </Box>
                <HStack alignItems={"start"}>
                  <Button mr={2} onClick={onSendToParker}>
                    Send 1 APT to Parker
                  </Button>
                  <VStack alignItems={"start"}>
                    <Tooltip
                      label={
                        userIsOperator
                          ? ""
                          : "Connected wallet must match the operator address"
                      }
                    >
                      <Button
                        isDisabled={!userIsOperator}
                        onClick={onRequestCommission}
                      >
                        Request commission
                      </Button>
                    </Tooltip>
                    <Text color={"red"} fontSize="xs" ml={2}></Text>
                  </VStack>
                </HStack>
              </>
            )}
          </Box>
        </Box>
        <MyHeading>Pool Overview</MyHeading>{" "}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="6">
          <Stat
            label={"Curr Principal"}
            value={numeral(formatAptos(data.managedPools[0].principal)).format(
              "0.000a"
            )}
          />
          <Stat
            label={"Initial Principal"}
            value={numeral(formatAptos(data.pool.initialPrincipal)).format(
              "0.000a"
            )}
          />
          <Stat
            label={"Cumulative Rewards"}
            value={formatAptos(data.managedPools[0].total_rewards)}
          />
          <Stat
            label={"Unrequested Rewards"}
            value={formatAptos(data.managedPools[0].currRewards)}
          />
          <Stat
            label={"Pending Inactive APT"}
            value={formatAptos(data.pool.pendingInactive)}
          />
          <Stat
            label={"Pending Active APT"}
            value={formatAptos(data.pool.pendingActive)}
          />
          <Stat
            label={"Min Stake"}
            value={numeral(
              formatAptos(data.stakingConfig.minimum_stake)
            ).format("0.00a")}
          />
          <Stat
            label={"Max Stake"}
            value={numeral(
              formatAptos(data.stakingConfig.maximum_stake)
            ).format("0.00a")}
          />
          {/* <Stat
          label={"Daily Rewards"}
          value={formatAptos(data.managedPools[0].rewardsPerDay)}
        /> */}
          {/* <Stat
          label={"APR"}
          value={Number(data.managedPools[0].apr).toFixed(2) + "%"}
        /> */}
        </SimpleGrid>
        <Divider />
        <MyHeading>Commissions</MyHeading>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="6">
          <Stat
            label={"Commission Percentage"}
            value={
              Number(data.managedPools[0].commission_percentage).toFixed(2) +
              "%"
            }
          />
          <Stat
            label={"Daily Avg Commission"}
            value={formatAptos(data.managedPools[0].commissionPerDay)}
          />
          <Stat
            label={"Requested Commission"}
            value={formatAptos(data.accumulatedCommissions)}
          />
          <Stat
            label={"Unrequested Commission"}
            value={formatAptos(data.managedPools[0].unrequestedCommissions)}
          />
          <Stat
            label={"Next Unlock At"}
            value={dayjs(data.pool.lockup_expiration_utc_time).format(
              "MM/DD/YY[\n]hh:mm A"
            )}
          />
        </SimpleGrid>
        <MyHeading>Current Epoch Performance</MyHeading>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="6">
          <Stat label={"Epoch"} value={data.epoch} />
          <Stat
            label={"Current Epoch Start"}
            value={dayjs
              .unix(data.current_epoch_start_time / 1_000_000)
              .format("MM/DD hh:mm A")}
          />
          <Stat
            label={"Next Epoch At"}
            value={dayjs
              .unix(data.next_epoch_start_time / 1_000_000)
              .format("MM/DD hh:mm A")}
          />
          <Stat
            label={"Successful Proposals"}
            value={`${data.current_epoch_successful_proposals} / ${
              data.current_epoch_successful_proposals +
              data.current_epoch_failed_proposals
            }`}
          />
          <Stat
            label={"Last Epoch Rewards"}
            value={formatAptos(data.previous_epoch_rewards[0])}
          />
          <Stat
            label={"Last Epoch Commission"}
            value={formatAptos(
              (Number(data.previous_epoch_rewards[0]) * 0.12).toString()
            )}
          />
        </SimpleGrid>
      </Stack>
      <MyHeading>Stake Pool Management</MyHeading>
      <Card minH="xs">
        <Tabs pt={1} px={1}>
          <TabList>
            <Tab>Epoch Rewards</Tab>
            <Tab>Requested Commissions</Tab>
            <Tab>Add Stake</Tab>
            <Tab>Withdraw Stake</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <RewardsTable data={data} />
            </TabPanel>
            <TabPanel>
              <RequestCommissionsTable data={data} />
            </TabPanel>
            <TabPanel>
              <AddStakeTable data={data} />
            </TabPanel>
            <TabPanel>
              <WithdrawalsTable data={data} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Stack>
  );
};

const RewardsTable = ({ data }: { data: any }) => (
  <TableContainer>
    <Table variant="simple">
      {/* <TableCaption>Epoch Rewards</TableCaption> */}
      <Thead>
        <Tr>
          <Th>Timestamp</Th>
          <Th>Rewards</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.previous_epoch_rewards.map((reward: string, i: number) => (
          <Tr key={i}>
            <Td>
              {dayjs
                .unix(data.current_epoch_start_time / 1_000_000 - 7200 * i)
                .format("MM/DD/YY HH:MM A")}
            </Td>
            <Td>{formatAptos(reward, 4)}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </TableContainer>
);
const RequestCommissionsTable = ({ data }: { data: any }) => (
  <TableContainer>
    <Table variant="simple">
      {/* <TableCaption>Epoch Rewards</TableCaption> */}
      <Thead>
        <Tr>
          <Th>Rewards Amount</Th>
          <Th>Commission Amount</Th>
          <Th>Operator</Th>
          <Th>Pool</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.requestCommissionEvents.map(
          (
            {
              accumulated_rewards,
              commission_amount,
              operator,
              pool_address,
            }: RequestCommissionEvent,
            idx: number
          ) => (
            <Tr key={idx}>
              <Td>{formatAptos(accumulated_rewards, 2)}</Td>
              <Td>{formatAptos(commission_amount, 2)}</Td>
              <Td>{operator.slice(0, 8)}...</Td>
              <Td>{pool_address.slice(0, 8)}...</Td>
            </Tr>
          )
        )}
      </Tbody>
    </Table>
  </TableContainer>
);
const AddStakeTable = ({ data }: { data: any }) => (
  <TableContainer>
    <Table variant="simple">
      {/* <TableCaption>Epoch Rewards</TableCaption> */}
      <Thead>
        <Tr>
          <Th>Amount Staked</Th>
          <Th>Pool Address</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.addStakeEvents.map(
          ({ amount_added, pool_address }: AddStakeEvent, idx: number) => (
            <Tr key={idx}>
              <Td>{formatAptos(amount_added, 2)}</Td>
              <Td>{pool_address.slice(0, 8)}...</Td>
            </Tr>
          )
        )}
      </Tbody>
    </Table>
  </TableContainer>
);
const WithdrawalsTable = ({ data }: { data: any }) => (
  <TableContainer>
    <Table variant="simple">
      {/* <TableCaption>Epoch Rewards</TableCaption> */}
      <Thead>
        <Tr>
          <Th>Amount Withdrawn</Th>
          <Th>Pool Address</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.withdrawStakeEvents.map(
          (
            { amount_withdrawn, pool_address }: WithdrawStakeEvent,
            index: number
          ) => (
            <Tr key={index}>
              <Td>{formatAptos(amount_withdrawn, 2)}</Td>
              <Td>{pool_address.slice(0, 8)}... </Td>
            </Tr>
          )
        )}
      </Tbody>
    </Table>
  </TableContainer>
);
const Card = (props: BoxProps) => (
  <Box
    minH="36"
    bg="bg-surface"
    boxShadow={useColorModeValue("sm", "sm-dark")}
    borderRadius="lg"
    {...props}
  />
);
