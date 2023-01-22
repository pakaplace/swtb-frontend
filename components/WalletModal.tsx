import { WalletReadyState, useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React from "react";

import CopyableField from "./CopyableField";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const WalletModal = (props: WalletModalProps) => {
  const { isOpen, onClose } = props;
  const { wallets, wallet, connect, disconnect, connected, account } =
    useWallet();
  const toast = useToast();

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
            <VStack alignItems={"flex-start"}>
              <Text mb={2}>Choose a wallet service to connect to:</Text>
              {wallets.map((wallet, idx) => (
                <Box key={idx} width="100%">
                  <Flex
                    alignItems="center"
                    justifyContent={"space-between"}
                    width="100%"
                    pt={2}
                    pb={3}
                  >
                    <Flex alignItems={"center"} gap={2}>
                      <Image src={wallet.icon} height={6} />
                      <Text>{wallet.name}</Text>
                    </Flex>
                    <Button
                      colorScheme={"black"}
                      variant={"outline"}
                      isDisabled={
                        wallet.readyState !== WalletReadyState.Installed
                      }
                      key={wallet.name}
                      size={"sm"}
                      onClick={() => {
                        connect(wallet.name);
                      }}
                    >
                      Connect
                    </Button>
                  </Flex>
                  {idx !== wallets.length - 1 && (
                    <hr
                      style={{
                        height: "0.5px",
                        width: "100%",
                        color: "var(--chakra-colors-gray-100)",
                      }}
                    />
                  )}
                </Box>
              ))}
            </VStack>
          )}
          {connected && (
            <Box>
              <Text fontWeight={"bold"}>{wallet?.name} Wallet:</Text>
              <CopyableField content={account?.address || ""} />
              <Button
                variant={"solid"}
                colorScheme="red"
                onClick={disconnect}
                size="sm"
              >
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

export default WalletModal;
