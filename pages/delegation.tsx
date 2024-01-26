import {
  Heading,
  Stack,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { ParsedUrlQuery } from "querystring";

import { formatAptosBigNumber } from "../utils";

type ChainData = {
  getStakeResult: [string, string, string]; // active, inactive, pending
  getPendingWidthdrawalResult: [boolean, string]; // has_pending_withdrawal, pending_withdrawal_amount
};
type DelegationEvent = {
  sequence_number: string;
  creation_number: string;
  pool_address: string;
  delegator_address: string;
  event_type: string;
  amount_added: string;
  add_stake_fee: string;
  amount_unlocked: string;
  amount_reactivated: string;
  amount_withdrawn: string;
  transaction_version: string;
  transaction_timestamp: string;
  inserted_at: string;
  event_index: string;
};

// DOCUMENTATION
// // https://github.com/aptos-labs/aptos-core/blob/d20fab97b7311cf04fe65cb8226debf9b2a0bdc4/aptos-move/framework/aptos-framework/doc/delegation_pool.md#0x1_delegation_pool_get_stake
export const getServerSideProps: GetServerSideProps<{
  events: DelegationEvent[];
  realtime: ChainData;
}> = async (context) => {
  const delegator = context.query.delegator as string;
  const pool = context.query.pool as string;

  const delegatorAddress =
    "0x17d78b53adf57b8653bd3035724b2a4ce6b8d0222ff9d2d58eebfcd3a9bd6c25";
  const poolAddress =
    "0x9c721c79ee082aafcdd99b1a71a833accdc48dba1a9a1bc5b5f8cc47ff7d49c0";
  const data = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/getDelegatorPerformanceByAddress?pool_address=${pool}&delegator_address=${delegator}`,
    {
      method: "GET",
    }
  );
  const chainData = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/getDelegationPerformance?pool_address=${pool}&delegator_address=${delegator}`,
    {
      method: "GET",
    }
  );
  const eventsParsed = await data.json();
  const chainDataParsed = await chainData?.json();

  console.log("events parsed~", eventsParsed);
  console.log("chain data parsed~", chainDataParsed);
  // .json();
  // if (data?.error) {
  //   return { props: { error: data.error } };
  // }
  // console.log("DATA", data);

  return {
    props: {
      events: eventsParsed,
      realtime: chainDataParsed,
    }, // will be passed to the page component as props
  };
};

const Home = ({
  events,
  realtime,
}: {
  events: DelegationEvent[];
  realtime: ChainData;
}) => {
  const totalAdded = events.reduce((acc, event) => {
    if (event.event_type === "AddStakeEvent") {
      return acc.plus(new BigNumber(event.amount_added));
    }
    return acc;
  }, new BigNumber(0));
  const currentStake = BigNumber(realtime?.getStakeResult[0]);
  // Calculate the percentage returned
  const percentageReturned = totalAdded.isZero()
    ? new BigNumber(0)
    : currentStake.minus(totalAdded).dividedBy(totalAdded).multipliedBy(100);
  console.log(percentageReturned?.toString());
  return (
    <>
      <Head>
        <title>Stake Aptos</title>
        <meta name="description" content="StakeAptos Staking Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <StatGroup>
        <Stat>
          <StatLabel>Total Delegated</StatLabel>
          <StatNumber>{formatAptosBigNumber(totalAdded, 4)}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Current Value</StatLabel>
          <StatNumber>{formatAptosBigNumber(currentStake, 4)}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>% Returned</StatLabel>
          <StatNumber>
            {percentageReturned.isNaN()
              ? "N/A"
              : `${percentageReturned.toFixed(3)}%`}
          </StatNumber>
        </Stat>
      </StatGroup>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Sequence Number</Th>
              <Th>Creation Number</Th>
              <Th>Pool Address</Th>
              <Th>Delegator Address</Th>
              <Th>Event Type</Th>
              <Th>Amount Added</Th>
              <Th>Add Stake Fee</Th>
              <Th>Amount Unlocked</Th>
              <Th>Amount Reactivated</Th>
              <Th>Amount Withdrawn</Th>
              <Th>Transaction Version</Th>
              <Th>Transaction Timestamp</Th>
            </Tr>
          </Thead>
          <Tbody>
            {events.map((event, index) => (
              <Tr key={index}>
                <Td>{event.sequence_number}</Td>
                <Td>{event.creation_number}</Td>
                <Td>{event.pool_address}</Td>
                <Td>{event.delegator_address}</Td>
                <Td>{event.event_type}</Td>
                <Td>{event.amount_added}</Td>
                <Td>{event.add_stake_fee}</Td>
                <Td>{event.amount_unlocked}</Td>
                <Td>{event.amount_reactivated}</Td>
                <Td>{event.amount_withdrawn}</Td>
                <Td>{event.transaction_version}</Td>
                <Td>
                  {new Date(event.transaction_timestamp).toLocaleString()}
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
