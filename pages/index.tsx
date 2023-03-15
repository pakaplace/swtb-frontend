import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Icon,
  Input,
  Stack,
  Text,
  Tooltip,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Router } from "next/router";
import { useState } from "react";
import { AiFillQuestionCircle } from "react-icons/ai";

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
  const network =
    typeof router.query.network === "string" &&
    router.query.network === "previewnet"
      ? "previewnet"
      : "mainnet";
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
        <Heading size={["xs", "sm"]} mb={8} color="gray.700">
          Aptos Validator Performance Dashboard
        </Heading>
        <Link
          href="https://dashboard.stakeaptos.com/dashboard/0x9da88926fd4d773fd499fc41830a82fe9c9ff3508435e7a16b2d8f529e77cdda/0xccc221485ee530f3981f4beca12f010d2e7bb38d3fe30bfcf7798d99f4aabb33?network=mainnet"
          replace
        >
          <Text
            fontSize={["sm"]}
            textAlign="left"
            as="span"
            fontWeight="semibold"
            color="blue.500"
            _hover={{ color: "blue.600" }}
            alignSelf="flex-start"
            textUnderlineOffset={1}
            cursor="pointer"
          >
            Mainnet <u>example</u> {", "}
          </Text>
        </Link>
        <Link
          href={`https://dashboard.stakeaptos.com/dashboard/55da0aea9a704b88a919622b2dd4fc057e6c992e28f7adb2f3bb398ba7b975f5/55da0aea9a704b88a919622b2dd4fc057e6c992e28f7adb2f3bb398ba7b975f5?network=previewnet`}
          replace
        >
          <Text
            fontSize={["sm"]}
            textAlign="left"
            as="span"
            fontWeight="semibold"
            color="blue.500"
            _hover={{ color: "blue.600" }}
            alignSelf="flex-start"
            textUnderlineOffset={1}
            cursor="pointer"
          >
            Previewnet <u>example</u>
          </Text>
        </Link>
        <Stack spacing={{ base: "8" }} mt={4}>
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
                A valid hex address starting with "0x" is required
              </FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={!!ownerError}>
            <VStack alignItems={"start"}>
              <FormLabel>Stake Pool Owner Address</FormLabel>
              <FormHelperText>
                If you have a vesting contract, your owner address may be your
                vesting contract address.
              </FormHelperText>
            </VStack>

            <Input
              type="hex"
              mt={2}
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              onBlur={() => {
                let isInvalid =
                  owner.length > 66 || owner.length < 64 || !isHex(owner);
                setOwnerError(isInvalid);
              }}
            />

            {!ownerError ? (
              <FormHelperText></FormHelperText>
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
                router.push(`/dashboard/${pool}/${owner}?network=${network}`);
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
