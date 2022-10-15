import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Icon,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";
import {
  FiArrowDownRight,
  FiArrowUpRight,
  FiMoreVertical,
} from "react-icons/fi";

interface Props {
  label: string;
  value: string;
  delta?: {
    value: string;
    isUpwardsTrend: boolean;
  };
}
export const Stat = (props: Props) => {
  const { label, value, delta, ...boxProps } = props;
  return (
    <Box
      bg="bg-surface"
      borderRadius="lg"
      boxShadow={useColorModeValue("sm", "sm-dark")}
      {...boxProps}
    >
      <Box px={{ base: "4", md: "6" }} py={{ base: "5", md: "6" }}>
        <Stack>
          <HStack justify="flex-start">
            <Text fontSize="sm" color="muted">
              {label}
            </Text>
            {/* <Icon as={FiMoreVertical} boxSize="5" color="muted" /> */}
          </HStack>
          <HStack justify="space-between">
            <Heading size={useBreakpointValue({ base: "sm", md: "md" })}>
              {value}
            </Heading>
            {/* <Badge variant="subtle" colorScheme={delta.isUpwardsTrend ? 'green' : 'red'}>
                <HStack spacing="1">
                  <Icon as={delta.isUpwardsTrend ? FiArrowUpRight : FiArrowDownRight} />
                  <Text>{delta.value}</Text>
                </HStack>
              </Badge> */}
          </HStack>
        </Stack>
      </Box>
      {/* <Divider /> */}
      {/* <Box px={{ base: "4", md: "6" }} py="4">
        <Button variant="link" colorScheme="blue" size="sm">
          Learn more
        </Button>
      </Box> */}
    </Box>
  );
};
