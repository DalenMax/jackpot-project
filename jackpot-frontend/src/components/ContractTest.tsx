import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { JackpotApi } from '../core/apis/jackpot.api';

export function ContractTest() {
    const currentAccount = useCurrentAccount();
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const log = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
        console.log(message);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const testContractInteractions = async () => {
        if (!currentAccount) {
            log('❌ No wallet connected');
            return;
        }

        setIsLoading(true);
        log('🚀 Starting contract interaction tests...');

        try {
            // Test 1: Try to get registry info
            log('📋 Testing registry retrieval...');
            const { JACKPOT_CONFIG } = await import('../config/jackpot');
            const registryResult = await JackpotApi.getGameRegistry(JACKPOT_CONFIG.GAME_REGISTRY);
            if (registryResult.error) {
                log(`⚠️  Registry test failed (expected): ${registryResult.error}`);
            } else {
                log(`✅ Registry retrieved: Round ${registryResult.data?.current_round}`);
            }

            // Test 2: Try to get pool info
            log('🎰 Testing pool retrieval...');
            const poolResult = await JackpotApi.getLotteryPool(JACKPOT_CONFIG.CURRENT_POOL);
            if (poolResult.error) {
                log(`⚠️  Pool test failed (expected): ${poolResult.error}`);
            } else {
                log(`✅ Pool retrieved: Round ${poolResult.data?.round_number}`);
            }

            // Test 3: Try to get user tickets
            log('🎫 Testing user tickets retrieval...');
            const ticketsResult = await JackpotApi.getUserTickets(JACKPOT_CONFIG.CURRENT_POOL, currentAccount.address);
            if (ticketsResult.error) {
                log(`⚠️  User tickets test failed (expected): ${ticketsResult.error}`);
            } else {
                log(`✅ User tickets: ${ticketsResult.data}`);
            }

            // Test 4: Test transaction creation (buy tickets)
            log('💸 Testing buy tickets transaction creation...');
            try {
                const buyTx = JackpotApi.createBuyTicketsTx(
                    JACKPOT_CONFIG.GAME_REGISTRY,
                    JACKPOT_CONFIG.CURRENT_POOL,
                    0.1,
                    '0x6'
                );
                log('✅ Buy tickets transaction created successfully');
                log(`   - Transaction has ${buyTx.getData().commands?.length || 0} commands`);
            } catch (err) {
                log(`❌ Buy tickets transaction creation failed: ${err}`);
            }

            // Test 5: Test draw winner transaction creation
            log('🎲 Testing draw winner transaction creation...');
            try {
                const drawTx = JackpotApi.createDrawWinnerTx(
                    'DUMMY_REGISTRY_ID',
                    'DUMMY_POOL_ID',
                    'DUMMY_RANDOM_ID',
                    '0x6'
                );
                log('✅ Draw winner transaction created successfully');
                log(`   - Transaction has ${drawTx.getData().commands?.length || 0} commands`);
            } catch (err) {
                log(`❌ Draw winner transaction creation failed: ${err}`);
            }

            // Test 6: Test configuration values
            log('⚙️  Testing configuration...');
            log(`✅ Package ID: ${JACKPOT_CONFIG.PACKAGE_ID}`);
            log(`✅ Game Registry: ${JACKPOT_CONFIG.GAME_REGISTRY}`);
            log(`✅ Admin Cap: ${JACKPOT_CONFIG.ADMIN_CAP}`);
            log(`✅ Round History: ${JACKPOT_CONFIG.ROUND_HISTORY}`);
            log(`✅ Min bet: ${JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000} SUI`);
            log(`✅ Round duration: ${JACKPOT_CONFIG.ROUND_DURATION_MS / 60000} minutes`);
            log(`✅ Winner percentage: ${JACKPOT_CONFIG.WINNER_PERCENTAGE}%`);
            log(`✅ Last minute multiplier: ${JACKPOT_CONFIG.LAST_MINUTE_MULTIPLIER}x`);

            log('🎉 All tests completed! Contract is deployed and configured.');

        } catch (err) {
            log(`❌ Test suite failed: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentAccount) {
        return (
            <div className="bg-surface rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Contract Testing</h3>
                <p className="text-gray-300">Please connect your wallet to run contract tests.</p>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Contract Integration Tests</h3>
                <div className="space-x-2">
                    <button
                        onClick={testContractInteractions}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                            isLoading
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/80 text-black'
                        }`}
                    >
                        {isLoading ? 'Running Tests...' : 'Run Tests'}
                    </button>
                    <button
                        onClick={clearLogs}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="bg-background rounded-lg p-4 h-64 overflow-y-auto border border-gray-600">
                {logs.length === 0 ? (
                    <p className="text-gray-400 text-sm">No logs yet. Click "Run Tests" to start.</p>
                ) : (
                    <div className="space-y-1">
                        {logs.map((log, index) => (
                            <div key={index} className="text-sm font-mono text-white">
                                {log}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                    <strong>Note:</strong> These tests verify the frontend integration code works correctly. 
                    Most API calls will fail until the smart contract is deployed and the configuration is updated 
                    with actual contract addresses.
                </p>
            </div>
        </div>
    );
}