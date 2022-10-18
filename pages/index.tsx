import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Box,
  Input,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  useBreakpointValue,
  Button,
  Heading,
} from "@chakra-ui/react";
import { Router } from "next/router";

type HomeProps = {
  data: any;
};

function isHex(val: string) {
  return Boolean(val.match(/^0x[0-9a-f]+$/i));
}

const Index = ({ data }: HomeProps) => {
  const [pool, setPool] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [poolError, setPoolError] = useState<boolean>(false);
  const [ownerError, setOwnerError] = useState<boolean>(false);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>SWTB</title>
        <meta name="description" content="SWTB Staking Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <Content data={data} /> */}
      <Box
        py={{ base: "0", sm: "8" }}
        px={{ base: "4", sm: "10" }}
        maxW="xl"
        mx="auto"
        justifyContent={"center"}
        bg={useBreakpointValue({ base: "transparent", sm: "bg-surface" })}
        boxShadow={{ base: "none", sm: "md" }}
        borderRadius={{ base: "none", sm: "xl" }}
      >
        <Heading size={"sm"} mb={8} color="gray.700">
          Aptos Validator Performance Dashboard
        </Heading>
        <Stack spacing={{ base: "8" }}>
          <FormControl isInvalid={!!poolError}>
            <FormLabel>Your Staking Pool Address</FormLabel>
            <Input
              type="hex"
              value={pool}
              onChange={(e) => setPool(e.target.value)}
              onBlur={() => {
                let isInvalid =
                  pool.length > 66 || pool.length < 64 || !isHex(pool);
                setPoolError(isInvalid);
              }}
            />
            {!poolError ? (
              <FormHelperText>
                Please enter your Staking Pool address
              </FormHelperText>
            ) : (
              <FormErrorMessage>
                A valid hex address starting with "0x" is required.
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={!!ownerError}>
            <FormLabel>Owner Address</FormLabel>
            <Input
              type="hex"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              onBlur={() => {
                let isInvalid =
                  owner.length > 66 || owner.length < 64 || !isHex(owner);
                setOwnerError(isInvalid);
              }}
            />
            {!ownerError ? (
              <FormHelperText>
                Please enter the address of the Stake Pool Owner
              </FormHelperText>
            ) : (
              <FormErrorMessage>
                A valid hex address starting with "0x" is required.
              </FormErrorMessage>
            )}
          </FormControl>
          <Button
            variant="primary"
            isDisabled={!pool || !owner || poolError || ownerError}
            onClick={async () => {
              if (pool && owner && !poolError && !ownerError) {
                router.push(`/dashboard/${pool}/${owner}`);
              }
            }}
          >
            View Staking Dashboard
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default Index;