import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { WalletReadyState, useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spacer,
  Text,
  VStack,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import * as React from "react";
import { FiHelpCircle, FiSearch, FiSettings } from "react-icons/fi";

import { Sidebar } from "../components/Sidebar";
import { Logo } from "./Logo";
import { ToggleButton } from "./ToggleButton";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal = (props: WalletModalProps) => {
  const { isOpen, onClose } = props;
  const { wallets, wallet, connect, disconnect, connected, account } =
    useWallet();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {!connected ? "Connect a Wallet" : "Wallet Connected"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!connected && (
            <VStack>
              {wallets.map((wallet) => (
                <Flex
                  alignItems="center"
                  justifyContent={"space-between"}
                  width="100%"
                  pb={2}
                >
                  <Box>
                    <Text>{wallet.name}</Text>
                  </Box>
                  <Button
                    mr={3}
                    colorScheme={"black"}
                    variant={"outline"}
                    disabled={wallet.readyState !== WalletReadyState.Installed}
                    key={wallet.name}
                    size={"sm"}
                    onClick={() => {
                      connect(wallet.name);
                    }}
                  >
                    Connect
                  </Button>
                </Flex>
              ))}
            </VStack>
          )}
          {connected && (
            <Box>
              <Text mb={2} fontSize={"sm"}>
                <b>{wallet?.name} Wallet:</b> {account?.address}
              </Text>
              <Button variant={"solid"} onClick={disconnect}>
                Disconnect
              </Button>
            </Box>
          )}
        </ModalBody>

        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const Navbar = () => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const { connect, connected, disconnect, wallets } = useWallet();

  return (
    <Box as="nav" bg="bg-accent" color="on-accent">
      <Container py={{ base: "3", lg: "4" }}>
        <Flex justify="space-between">
          <HStack spacing="4">
            <Logo />
            <ButtonGroup variant="ghost-on-accent" spacing="1">
              <Button onClick={() => router.push("/")}>Home</Button>
              <Button onClick={onOpen}>Manage Wallet</Button>
              <WalletModal isOpen={isOpen} onClose={onClose} />
              {/* <Button aria-current="page">Dashboard</Button> */}
              {/* <Button>Tasks</Button>
                <Button>Bookmarks</Button>
                <Button>Users</Button> */}
            </ButtonGroup>
          </HStack>
          {/* {isDesktop ? (
            <HStack spacing="4">
              <ButtonGroup variant="ghost-on-accent" spacing="1">
                <IconButton
                  icon={<FiSearch fontSize="1.25rem" />}
                  aria-label="Search"
                />
                <IconButton
                  icon={<FiSettings fontSize="1.25rem" />}
                  aria-label="Settings"
                />
                <IconButton
                  icon={<FiHelpCircle fontSize="1.25rem" />}
                  aria-label="Help Center"
                />
              </ButtonGroup>
            </HStack>
          ) : (
            <>
              <ToggleButton
                isOpen={isOpen}
                aria-label="Open Menu"
                onClick={onToggle}
              />
              <Drawer
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                isFullHeight
                preserveScrollBarGap
                // Only disabled for showcase
                trapFocus={false}
              >
                <DrawerOverlay />
                <DrawerContent>
                  <Sidebar />
                </DrawerContent>
              </Drawer>
            </>
          )} */}
        </Flex>
      </Container>
    </Box>
  );
};
