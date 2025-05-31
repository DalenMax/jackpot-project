import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

export function WalletConnection() {
    const currentAccount = useCurrentAccount();
    const { mutate: disconnect } = useDisconnectWallet();

    if (!currentAccount) {
        return (
            <div className="flex flex-col items-center space-y-4 p-6 bg-surface rounded-lg border border-gray-700">
                <h2 className="text-xl font-bold text-white">Connect Your Wallet</h2>
                <p className="text-gray-300 text-center">
                    Connect your Sui wallet to start playing SuiJackpot
                </p>
                <ConnectButton 
                    connectText="Connect Wallet"
                    className="bg-primary hover:bg-primary/80 text-black font-bold py-2 px-6 rounded-lg transition-colors"
                />
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4 p-4 bg-surface rounded-lg border border-gray-700">
            <div className="flex-1">
                <p className="text-sm text-gray-300">Connected as:</p>
                <p className="font-mono text-sm text-white truncate">
                    {currentAccount.address}
                </p>
            </div>
            <button
                onClick={() => disconnect()}
                className="bg-danger hover:bg-danger/80 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Disconnect
            </button>
        </div>
    );
}