import { Heading, Stack } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { ParsedUrlQuery } from "querystring";

import { Content } from "../../components/Content";

interface IParams extends ParsedUrlQuery {
  address: string[];
}

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

type HomeProps = {
  data: ResponseData;
  pool: string;
  owner: string;
  error?: string;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { address } = context.params as IParams;
  let network: string = "mainnet";
  console.log("context.query?.network", context.query?.network);
  if (typeof context.query?.network === "string") {
    if (context.query.network.toLowerCase() === "previewnet")
      network = "previewnet";
  }
  console.log("determined network", network);
  if (address?.length !== 2) {
    return {
      notFound: true,
    };
  }
  const [pool, owner] = address;
  const data = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/getPerformance?pool=${pool}&owner=${owner}&network=${network}`,
      {
        method: "GET",
      }
    )
  ).json();
  if (data?.error) {
    return { props: { error: data.error } };
  }
  console.log("DATA", data);
  return {
    props: { data, pool, owner }, // will be passed to the page component as props
  };
};

const Home = ({ data, pool, owner, error }: HomeProps) => {
  if (error)
    return (
      <Stack spacing={{ base: "8", lg: "6" }} width="100%">
        <Heading size={"sm"} mb={8} color="gray.700">
          Error - {error}
        </Heading>
      </Stack>
    );
  return (
    <>
      <Head>
        <title>Stake Aptos</title>
        <meta name="description" content="StakeAptos Staking Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Content data={data} pool={pool} owner={owner} />
    </>
  );
};

export default Home;
