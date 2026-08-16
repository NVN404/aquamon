'use client';

import '@getpara/react-sdk/styles.css';
import { Environment, ParaProvider } from '@getpara/react-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'wagmi';
import { monadTestnet } from 'wagmi/chains';
import type { ReactNode } from 'react';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: ReactNode }) {
  const paraApiKey = process.env.NEXT_PUBLIC_PARA_API_KEY || 'beta_304e92ef208bef18c1122e3f3eb6a177';

  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: paraApiKey,
          env: Environment.BETA,
        }}
        config={{ appName: 'AquaMon — Water Conservation DePIN' }}
        paraModalConfig={{
          oAuthMethods: ['GOOGLE', 'APPLE', 'DISCORD', 'TWITTER'],
          disablePhoneLogin: false,
          recoverySecretStepEnabled: true,
        }}
        externalWalletConfig={{
          evmConnector: {
            config: {
              chains: [monadTestnet],
              transports: {
                [monadTestnet.id]: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz'),
              },
            },
          },
          wallets: ['METAMASK', 'COINBASE', 'WALLETCONNECT', 'RAINBOW'],
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}
