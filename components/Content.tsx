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
import * as React from "react";
import { FiDownloadCloud } from "react-icons/fi";
import { Stat } from "./Stat";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import numeral from "numeral";

const formatAptos = (val: string) => BigNumber(val).shiftedBy(-8).toFormat(0);
interface ContentProps {
  data: any;
}
export const Content = ({ data }: ContentProps) => (
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
        Overall Performance
      </Heading>{" "}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="6">
        <Stat
          label={"Principal"}
          value={numeral(formatAptos(data.managedPools[0].principal)).format(
            "0.000a"
          )}
        />
        <Stat
          label={"Total Rewards"}
          value={formatAptos(data.managedPools[0].total_rewards)}
        />

        <Stat
          label={"Daily Rewards"}
          value={formatAptos(data.managedPools[0].rewardsPerDay)}
        />
        <Stat
          label={"APR"}
          value={Number(data.managedPools[0].apr).toFixed(2) + "%"}
        />
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
            Number(data.managedPools[0].commission_percentage).toFixed(2) + "%"
          }
        />
        <Stat
          label={"Daily Commission"}
          value={formatAptos(data.managedPools[0].commissionPerDay)}
        />
        <Stat
          label={"Commission"}
          value={formatAptos(data.managedPools[0].commission_not_yet_unlocked)}
        />
        <Stat
          label={"Next Unlock At"}
          value={dayjs(data.directPool.lockup_expiration_utc_time).format(
            "MM/DD/YY hh:mm A"
          )}
        />
      </SimpleGrid>
    </Stack>
    {/* <Card minH="xs" /> */}
  </Stack>
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
