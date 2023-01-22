import { Box, Flex, Text, Tooltip, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { TbCheck, TbCopy } from "react-icons/tb";

interface CopyableFieldProps {
  content: string;
}

const CopyableField = (props: CopyableFieldProps) => {
  const toast = useToast();

  const { content } = props;
  const [copied, setCopied] = useState(false);

  const onCopyToClipboard = () => {
    toast({
      title: "Copied to clipboard",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top",
      variant: "subtle",
    });
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <Flex
      bgColor={"var(--chakra-colors-gray-50)"}
      borderRadius={"md"}
      p={2}
      my={2}
      alignItems={"center"}
      justifyContent="space-between"
      maxWidth="fit-content"
    >
      <Text
        overflow="hidden"
        whiteSpace={"nowrap"}
        textOverflow="ellipsis"
        mb={2}
        pr={3}
        fontWeight={"medium"}
        fontSize={"sm"}
        margin={0}
      >
        {content}
      </Text>
      <CopyToClipboard text={content} onCopy={onCopyToClipboard}>
        <Box>
          <Tooltip label="Copy to clipboard">
            <span>
              {!copied && <TbCopy cursor={"pointer"} size={18} />}
              {copied && <TbCheck cursor={"pointer"} size={18} />}
            </span>
          </Tooltip>
        </Box>
      </CopyToClipboard>
    </Flex>
  );
};

export default CopyableField;
