import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { theme as proTheme } from "@chakra-ui/pro-theme";
import { Box, ChakraProvider, Container, extendTheme } from "@chakra-ui/react";
import "@fontsource/inter/variable.css";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import type { AppProps } from "next/app";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import * as React from "react";

import { Navbar } from "../components/Navbar";
import "../styles/globals.css";

export const theme = extendTheme(
  {
    colors: { ...proTheme.colors, brand: proTheme.colors.purple },
  },
  proTheme
);

const wallets = [new MartianWallet(), new PetraWallet(), new FewchaWallet()];

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
