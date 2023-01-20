import type { NextPage } from "next";
import Head from "next/head";
import { Content } from "../../components/Content";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import dynamic from "next/dynamic";

const Web3Provider = dynamic(() => import("@fewcha/web3-react"), {
  ssr: false,
});

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
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { address } = context.params as IParams;
  if (address?.length !== 2) {
    return {
      notFound: true,
    };
  }
  const [pool, owner] = address;
  const data = await (
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/getPerformance?pool=${pool}&owner=${owner}`,
      {
        method: "GET",
      }
    )
  ).json();
  return {
    props: { data }, // will be passed to the page component as props
  };
};

const Home = ({ data }: HomeProps) => {
  return (
    <>
      <Head>
        <title>SWTB</title>
        <meta name="description" content="SWTB Staking Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Web3Provider>
        <Content data={data} />
      </Web3Provider>
    </>
  );
};

export default Home;
