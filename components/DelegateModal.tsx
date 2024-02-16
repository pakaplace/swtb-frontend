// Create a new file for the component, e.g., DelegateModal.tsx
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";

import { formatAptos } from "../utils";

// Adjust the import path if necessary

interface DelegateModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: string;
  delegateAmount: string;
  setDelegateAmount: (value: string) => void;
  handleDelegateSubmit: () => void;
}

export const DelegateModal = ({
  isOpen,
  onClose,
  balance,
  delegateAmount,
  setDelegateAmount,
  handleDelegateSubmit,
}: DelegateModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delegate More</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Amount to Delegate</FormLabel>
            <Input
              type="number"
              placeholder="Enter amount"
              value={delegateAmount}
              onChange={(e) => setDelegateAmount(e.target.value)}
              max={new BigNumber(balance).shiftedBy(-8).toString()} // Set the max attribute to the balance shifted by 8 digits to the right
            />
            <FormHelperText>
              {balance
                ? `Balance: ${formatAptos(balance, 2)} APT`
                : "Loading..."}
            </FormHelperText>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleDelegateSubmit}>
            Submit
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
