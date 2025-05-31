import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { JACKPOT_CONFIG } from '../config/jackpot';

// Registry ID from your deployment
const REGISTRY_ID = "0xf08234a5462b5b9e398de0e213a09f58d7b4e5e6ae7840258be0ebf057666f3e";
const CLOCK_ID = "0x6"; // Sui Clock object ID

export function AdminPanel() {
    const currentAccount = useCurrentAccount();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [isCreating, setIsCreating] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
        console.log(message);
    };

    const createInitialPool = async () => {
        if (!currentAccount) {
            log('❌ Please connect your wallet first');
            return;
        }

        setIsCreating(true);
        log('🚀 Creating initial lottery pool...');

        try {
            const tx = new Transaction();
            
            // Note: You'll need to pass the AdminCap object ID
            // This assumes the user has the AdminCap in their wallet
            tx.moveCall({
                target: `${JACKPOT_CONFIG.PACKAGE_ID}::${JACKPOT_CONFIG.MODULE_NAME}::create_initial_pool`,
                arguments: [
                    tx.object('ADMIN_CAP_OBJECT_ID_HERE'), // Replace with actual AdminCap object ID
                    tx.object(REGISTRY_ID),
                    tx.object(CLOCK_ID),
                ],
            });

            signAndExecuteTransaction(
                { transaction: tx },
                {
                    onSuccess: (result) => {
                        log('✅ Initial pool created successfully!');
                        log(`   Transaction: ${result.digest}`);
                        log('🎉 The lottery is now ready to play!');
                        
                        // Refresh the page after a few seconds to see the new pool
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    },
                    onError: (error) => {
                        log(`❌ Failed to create pool: ${error.message}`);
                        console.error('Transaction failed:', error);
                    },
                }
            );
        } catch (err) {
            log(`❌ Error creating transaction: ${err}`);
            console.error('Error:', err);
        } finally {
            setIsCreating(false);
        }
    };

    if (!currentAccount) {
        return (
            <div className="bg-surface rounded-lg p-6 border border-yellow-500/30">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">Admin Panel</h3>
                <p className="text-gray-300">Connect your wallet to access admin functions.</p>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-lg p-6 border border-yellow-500/30">
            <h3 className="text-lg font-bold text-yellow-400 mb-4">🔧 Admin Panel</h3>
            
            <div className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300 text-sm mb-3">
                        <strong>Note:</strong> To create the initial pool, you need the AdminCap object. 
                        The AdminCap was transferred to the deployer address during contract initialization.
                    </p>
                    <p className="text-gray-300 text-xs">
                        If you have the AdminCap, update the ADMIN_CAP_OBJECT_ID in this component's code.
                    </p>
                </div>

                <button
                    onClick={createInitialPool}
                    disabled={isCreating}
                    className={`w-full py-3 px-6 rounded-lg font-bold transition-colors ${
                        isCreating
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                    }`}
                >
                    {isCreating ? 'Creating Pool...' : '🎰 Create Initial Lottery Pool'}
                </button>

                {logs.length > 0 && (
                    <div className="bg-background rounded-lg p-4 h-32 overflow-y-auto border border-gray-600">
                        <div className="space-y-1">
                            {logs.map((log, index) => (
                                <div key={index} className="text-sm font-mono text-white">
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 text-xs text-gray-400">
                <p><strong>Current Round:</strong> 0 (No active pool)</p>
                <p><strong>Package ID:</strong> {JACKPOT_CONFIG.PACKAGE_ID}</p>
                <p><strong>Registry ID:</strong> {REGISTRY_ID}</p>
            </div>
        </div>
    );
}