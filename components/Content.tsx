import {
  Box,
  BoxProps,
  Button,
  Divider,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  RequestCommissionEvent,
  AddStakeEvent,
  WithdrawStakeEvent,
} from "../pages/api/getPerformance";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";

// import dynamic from "next/dynamic";
// const { ConnectWallet, useWeb3 } = dynamic(() => import("@fewcha/web3-react"), {
//   ssr: false,
// });

import * as React from "react";
import { FiDownloadCloud } from "react-icons/fi";
import { Stat } from "./Stat";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import numeral from "numeral";
import { ConnectWallet, useWeb3 } from "@fewcha/web3-react";

const formatAptos = (val: string, decimals?: number) =>
  BigNumber(val)
    .shiftedBy(-8)
    .toFormat(decimals ?? 0);
interface ContentProps {
  data: any;
}

export const Content = ({ data }: ContentProps) => {
  const {
    account,
    balance,
    isConnected,
    network,
    fewcha,
    martian,
    currentWallet,
  } = useWeb3();
  console.log(martian);
  return (
    <Stack spacing={{ base: "8", lg: "6" }}>
      <Stack
        spacing="4"
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
      >
        <Stack spacing="1">
          <Heading
            size={useBreakpointValue({ base: "sm", lg: "md" })}
            fontWeight="medium"
          >
            Dashboard
          </Heading>
          <Text color="muted">All important metrics at a glance</Text>
          {!isConnected && <ConnectWallet type="list" />}
          {isConnected && <span>Wallet connected: {currentWallet}.</span>}
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
        <Heading
          size={useBreakpointValue({ base: "xs", lg: "sm" })}
          fontWeight="medium"
        >
          Pool Overview
        </Heading>{" "}
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
            label={"Cummulative Rewards"}
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
        <Heading
          size={useBreakpointValue({ base: "xs", lg: "sm" })}
          fontWeight="medium"
        >
          Commissions
        </Heading>{" "}
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
              "MM/DD/YY hh:mm A"
            )}
          />
        </SimpleGrid>
        <Heading
          size={useBreakpointValue({ base: "xs", lg: "sm" })}
          fontWeight="medium"
        >
          Current Epoch Performance
        </Heading>{" "}
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
      <Heading
        size={useBreakpointValue({ base: "xs", lg: "sm" })}
        fontWeight="medium"
      >
        Stake Pool Management
      </Heading>
      <Card minH="xs">
        <Tabs>
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
          <Tr>
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
          ({
            accumulated_rewards,
            commission_amount,
            operator,
            pool_address,
          }: RequestCommissionEvent) => (
            <Tr>
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
          ({ amount_added, pool_address }: AddStakeEvent) => (
            <Tr>
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
          ({ amount_withdrawn, pool_address }: WithdrawStakeEvent) => (
            <Tr>
              <Td>{formatAptos(amount_withdrawn, 2)}</Td>
              <Td>{pool_address.slice(0, 8)}...</Td>{" "}
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
