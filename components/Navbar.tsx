import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Container,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  useBreakpointValue,
  useDisclosure,
} from "@chakra-ui/react";
import * as React from "react";
import { FiHelpCircle, FiSearch, FiSettings } from "react-icons/fi";
import { Logo } from "./Logo";
import { Sidebar } from "../components/Sidebar";
import { ToggleButton } from "./ToggleButton";
import { useRouter } from "next/router";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet, WalletReadyState } from "@aptos-labs/wallet-adapter-react";

export const Navbar = () => {
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { isOpen, onToggle, onClose } = useDisclosure();
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
              {/* {!connected && <WalletSelector />} */}
              {!connected && (
                <>
                  {wallets.map((wallet) => (
                    <Button
                      className={`bg-blue-500  text-white font-bold py-2 px-4 rounded mr-4 ${
                        wallet.readyState !== "Installed"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-blue-700"
                      }`}
                      disabled={
                        wallet.readyState !== WalletReadyState.Installed
                      }
                      key={wallet.name}
                      onClick={() => connect(wallet.name)}
                    >
                      <>{wallet.name}</>
                    </Button>
                  ))}
                </>
              )}
              {connected && <Button onClick={disconnect}>Disconnect</Button>}
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
