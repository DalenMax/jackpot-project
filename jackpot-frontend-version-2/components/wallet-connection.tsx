"use client";

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';

export function WalletConnection() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-4">
        <ConnectButton />
        {currentAccount && (
          <div className="text-sm text-gray-400">
            Connected: {currentAccount.address?.slice(0, 8)}...{currentAccount.address?.slice(-6)}
          </div>
        )}
      </div>
    </div>
  );
}