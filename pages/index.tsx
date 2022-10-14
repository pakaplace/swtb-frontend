import type { NextPage } from "next";
import Head from "next/head";
import { Content } from "../components/Content";
const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>SWTB</title>
        <meta name="description" content="SWTB Staking Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Content />
    </>
  );
};

export default Home;
