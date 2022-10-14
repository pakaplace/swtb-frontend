import type { NextPage } from "next";
import Head from "next/head";
import { Content } from "../components/Content";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await (
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getPerformance`, {
      method: "GET",
    })
  ).json();
  return {
    props: { data }, // will be passed to the page component as props
  };
};

const Home: NextPage = ({ data }: { data: any }) => {
  return (
    <>
      <Head>
        <title>SWTB</title>
        <meta name="description" content="SWTB Staking Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Content data={data} />
    </>
  );
};

export default Home;
