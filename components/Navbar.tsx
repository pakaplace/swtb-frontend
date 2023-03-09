import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  HStack,
  Icon,
  Select,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FiHome } from "react-icons/fi";

import { Logo } from "./Logo";
import WalletModal from "./WalletModal";

export const Navbar = () => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const network = router.query.network;
  const [net, setNet] = useState<string>("mainnet");
  useEffect(() => {
    if (typeof network === "string") {
      setNet(typeof network === "string" ? network : "mainnet");
    }
  }, [network]);
  return (
    <Box as="nav" bg="bg-accent" color="on-accent">
      <Container py={{ base: "3", lg: "4" }}>
        <Flex justify="space-between">
          <HStack spacing="2">
            <ButtonGroup variant="ghost-on-accent" size={["sm", "md"]}>
              <Button
                leftIcon={<Icon as={FiHome} />}
                onClick={() => router.push("/")}
              >
                Home
              </Button>
              {net === "mainnet" && (
                <Button variant={"outline"} px={2} onClick={onOpen}>
                  Manage Wallet
                </Button>
              )}
              <WalletModal isOpen={isOpen} onClose={onClose} />
            </ButtonGroup>
            <Select
              px={2}
              value={net}
              size={["sm", "md"]}
              onChange={(e) => {
                setNet(e.target.value);
                router.replace({
                  query: { ...router.query, network: e.target.value },
                });
              }}
            >
              <option value="mainnet">Mainnet</option>
              <option value="previewnet">Previewnet</option>
            </Select>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};
