import { createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient } from '@tanstack/react-query';

// Network configuration
export const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: { url: getFullnodeUrl('testnet') },
    mainnet: { url: getFullnodeUrl('mainnet') },
    localnet: { url: getFullnodeUrl('localnet') },
});

// React Query client
export const queryClient = new QueryClient();