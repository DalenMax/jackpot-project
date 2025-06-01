import { useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export function useWalletStorage() {
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    if (currentAccount) {
      // Store wallet connection state
      localStorage.setItem('sui_wallet_connected', 'true');
      localStorage.setItem('sui_wallet_address', currentAccount.address);
      console.log('💾 Wallet connection saved');
    } else {
      // Clear wallet connection state
      localStorage.removeItem('sui_wallet_connected');
      localStorage.removeItem('sui_wallet_address');
      console.log('🗑️ Wallet connection cleared');
    }
  }, [currentAccount]);

  return {
    wasConnected: typeof window !== 'undefined' && localStorage.getItem('sui_wallet_connected') === 'true',
    lastAddress: typeof window !== 'undefined' ? localStorage.getItem('sui_wallet_address') : null
  };
}