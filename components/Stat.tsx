import {
  Badge,
  Box,
  Button,
  Divider,
  HStack,
  Heading,
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
  bottomLabel?: string;
}
export const Stat = (props: Props) => {
  const { label, value, delta, bottomLabel, ...boxProps } = props;
  return (
    <Box
      bg="bg-surface"
      borderRadius="lg"
      boxShadow={useColorModeValue("xs", "xs-dark")}
      {...boxProps}
    >
      <Box px={{ base: "4", md: "6" }} py={{ base: "5", md: "6" }}>
        <Stack>
          <HStack justify="flex-start">
            <Text
              casing={"uppercase"}
              fontWeight={"medium"}
              fontSize="xs"
              letterSpacing={"1px"}
              color="muted"
            >
              {label}
            </Text>
            {/* <Icon as={FiMoreVertical} boxSize="5" color="muted" /> */}
          </HStack>
          <HStack justify="space-between">
            <Text
              fontWeight={"semibold"}
              fontSize={useBreakpointValue({ base: "2xl", md: "3xl" })}
              whiteSpace={"pre"}
            >
              {value}
            </Text>
            {bottomLabel && <Text color="gray.500">{bottomLabel}</Text>}

            {delta && (
              <Badge
                variant="subtle"
                colorScheme={delta?.isUpwardsTrend ? "green" : "red"}
              >
                <HStack spacing="1">
                  <Icon
                    as={
                      delta?.isUpwardsTrend ? FiArrowUpRight : FiArrowDownRight
                    }
                  />
                  <Text>{delta?.value}</Text>
                </HStack>
              </Badge>
            )}
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
