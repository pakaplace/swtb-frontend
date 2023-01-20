import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { Box, Container } from "@chakra-ui/react";
import * as React from "react";
import { Navbar } from "../components/Navbar";
import { theme as proTheme } from "@chakra-ui/pro-theme";
import "@fontsource/inter/variable.css";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

export const theme = extendTheme(
  {
    colors: { ...proTheme.colors, brand: proTheme.colors.purple },
  },
  proTheme
);

const wallets = [new MartianWallet()];

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AptosWalletAdapterProvider plugins={wallets}>
      <ChakraProvider theme={proTheme}>
        <Box as="section" height="100vh" overflowY="auto">
          <Navbar />
          <Container pt={{ base: "8", lg: "12" }} pb={{ base: "12", lg: "24" }}>
            <Component {...pageProps} />
          </Container>
        </Box>
      </ChakraProvider>
    </AptosWalletAdapterProvider>
  );
}

export default MyApp;
