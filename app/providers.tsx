"use client";

import { SessionProvider } from "next-auth/react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { WagmiProvider } from "wagmi";
import { polygon, polygonMumbai } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";
const metadata  = { name: "Willow PropTech", description: "Africa's Real Estate OS", url: "https://willow.ng", icons: ["https://willow.ng/icon.png"] };
const chains    = [polygonMumbai, polygon] as const;
const config    = defaultWagmiConfig({ chains, projectId, metadata });
createWeb3Modal({ wagmiConfig: config, projectId, defaultChain: polygonMumbai });

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
