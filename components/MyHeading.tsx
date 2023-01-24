import { Heading, useBreakpointValue } from "@chakra-ui/react";
import React from "react";

interface MyHeadingProps {
  children: JSX.Element | string;
}

export const MyHeading = (props: MyHeadingProps) => {
  const { children } = props;
  return (
    <Heading
      size={useBreakpointValue({ base: "xs" })}
      fontWeight="medium"
      mt={3}
    >
      {children}
    </Heading>
  );
};
