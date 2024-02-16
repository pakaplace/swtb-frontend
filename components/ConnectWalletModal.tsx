import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { WalletRemove } from "iconsax-react";
import React, { useState } from "react";

import isHex from "../lib/utils/isHex";

// Define the props that WalletModal will accept
interface WalletModalProps {
  isOpen: boolean;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  onClose: () => void;
}
const aptosConfig = new AptosConfig({
  fullnode: process.env.NEXT_PUBLIC_API_URL_MAINNET,
});
const aptos = new Aptos(aptosConfig);

async function checkAccountExists(accountAddress: string): Promise<boolean> {
  try {
    const accountInfo = await aptos.getAccountInfo({ accountAddress });
    console.log("Account info", accountInfo);
    return !!accountInfo;
  } catch (error) {
    if (error?.response && error?.response?.status === 404) {
      return false; // Account does not exist
    }
    console.log(error); // An error occurred that isn't related to the existence of the account
    return false;
  }
}

const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  address,
  setAddress,
  onClose,
}) => {
  const [addressError, setAddressError] = useState<boolean>(false);
  const [localAddress, setLocalAddress] = useState<string>(address);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAddress(e.target.value);
  };

  const handleAddressValidation = async () => {
    let isInvalid =
      localAddress.length > 66 ||
      localAddress.length < 64 ||
      !isHex(localAddress);
    console.log("Is invalid", isInvalid);
    if (isInvalid) {
      return setAddressError(isInvalid);
    }
    console.log("Checking account", localAddress);
    const accountExists = await checkAccountExists(localAddress);
    console.log("Account exists", accountExists);
    if (accountExists) {
      console.log("Setting address", localAddress);
      setAddressError(false);
      setAddress(localAddress); // Update the address state only if it's valid and exists
      onClose();
    } else {
      setAddressError(true);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        {/* <ModalCloseButton /> */}
        <ModalBody>
          <Box py={["10", "10", "14"]} px={["6", "6", "10"]}>
            <Heading
              color="black"
              fontSize={["3xl", "3xl", "4xl"]}
              lineHeight={["9", "9", "10"]}
              fontWeight="bold"
              mb={["2", "4"]}
            >
              Connect a Wallet
            </Heading>
            <Text
              color="black"
              fontSize={["lg", "lg", "xl"]}
              lineHeight="7"
              fontWeight="medium"
              mb={["6"]}
            >
              Get started by connecting a wallet or entering an address
            </Text>
            <Center mb="4">
              <WalletRemove size="48" color="#3182CE" variant="Bulk" />
            </Center>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={onClose}
              w="full"
              mb={["6", "10"]}
            >
              Connect Wallet
            </Button>
            <HStack px="2" mb={["6", "10"]} w="full">
              <Divider borderColor="gray.500" />
              <Text color="gray.500" fontSize="sm" lineHeight="120%">
                or
              </Text>
              <Divider borderColor="gray.500" />
            </HStack>
            <FormControl isInvalid={!!addressError}>
              <FormLabel>Enter your wallet address</FormLabel>
              <InputGroup>
                <Input
                  type="text"
                  value={localAddress}
                  onChange={handleAddressChange}
                  onBlur={handleAddressValidation}
                  placeholder="0x123..."
                />
                <InputRightElement width="4.5rem">
                  <Button
                    h="2rem"
                    size="sm"
                    colorScheme="blue"
                    onClick={async (e) => {
                      await handleAddressValidation();
                    }}
                  >
                    Continue
                  </Button>
                </InputRightElement>
              </InputGroup>
              {!addressError ? (
                <FormHelperText>
                  Enter the address you wish to check
                </FormHelperText>
              ) : (
                <FormErrorMessage>
                  A valid Aptos address is required.
                </FormErrorMessage>
              )}
            </FormControl>
          </Box>
        </ModalBody>

        {/* <ModalFooter>

          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export default WalletModal;
