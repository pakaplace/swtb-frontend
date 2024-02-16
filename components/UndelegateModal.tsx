// Create a new file for the component, e.g., UndelegateModal.tsx
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

interface UndelegateModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: string;
  undelegateAmount: string;
  setUndelegateAmount: (value: string) => void;
  handleUndelegateSubmit: () => void;
}

export const UndelegateModal = ({
  isOpen,
  onClose,
  balance,
  undelegateAmount,
  setUndelegateAmount,
  handleUndelegateSubmit,
}: UndelegateModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Undelegate</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Amount to Undelegate</FormLabel>
            <Input
              type="number"
              placeholder="Enter amount"
              value={undelegateAmount}
              onChange={(e) => setUndelegateAmount(e.target.value)}
              max={new BigNumber(balance).shiftedBy(-8).toString()} // Set the max attribute to the balance shifted by 8 digits to the right
            />
            <FormHelperText>
              {balance
                ? `Staked Balance: ${formatAptos(balance, 2)} APT`
                : "Loading..."}
            </FormHelperText>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={handleUndelegateSubmit}>
            Undelegate
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
