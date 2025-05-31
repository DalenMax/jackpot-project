import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useJackpot } from '../core/hooks/use-jackpot.hook';
import { JackpotApi } from '../core/apis/jackpot.api';
import { JACKPOT_CONFIG } from '../config/jackpot';
import { useState } from 'react';

// Use configuration from environment
const REGISTRY_ID = JACKPOT_CONFIG.GAME_REGISTRY;
const CLOCK_ID = '0x6'; // Sui Clock object ID

export function JackpotGame() {
    const currentAccount = useCurrentAccount();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [betAmount, setBetAmount] = useState(0.1);
    const [isTransacting, setIsTransacting] = useState(false);

    const {
        currentPool,
        userStats,
        isLoading,
        error,
        isRoundActive,
        isRoundEnded,
        formatTimeRemaining,
        getTimeRemaining,
    } = useJackpot();

    const handleBuyTickets = async () => {
        if (!currentAccount || !currentPool || !isRoundActive()) {
            console.log('Cannot buy tickets: missing requirements');
            return;
        }

        setIsTransacting(true);
        try {
            const tx = JackpotApi.createBuyTicketsTx(
                REGISTRY_ID,
                currentPool.id,
                betAmount,
                CLOCK_ID
            );

            signAndExecuteTransaction(
                { transaction: tx },
                {
                    onSuccess: (result) => {
                        console.log('Transaction successful:', result);
                        // Refresh data after successful transaction
                        setTimeout(() => {
                            window.location.reload(); // Simple refresh for now
                        }, 2000);
                    },
                    onError: (error) => {
                        console.error('Transaction failed:', error);
                    },
                }
            );
        } catch (err) {
            console.error('Error creating transaction:', err);
        } finally {
            setIsTransacting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-xl text-white">Loading game data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-danger/20 border border-danger/50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-danger mb-2">Error</h3>
                <p className="text-white">{error}</p>
            </div>
        );
    }

    if (!currentPool) {
        return (
            <div className="bg-surface rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-white mb-2">No Active Round</h3>
                {!JACKPOT_CONFIG.CURRENT_POOL ? (
                    <div>
                        <p className="text-gray-300 mb-4">No lottery pool has been created yet.</p>
                        <p className="text-sm text-gray-400">An admin needs to create the initial pool using the Admin Panel.</p>
                    </div>
                ) : (
                    <p className="text-gray-300">Waiting for the next lottery round to begin...</p>
                )}
            </div>
        );
    }

    const timeRemaining = getTimeRemaining();
    const isLastMinute = timeRemaining <= JACKPOT_CONFIG.LAST_MINUTE_MS;

    return (
        <div className="space-y-6">
            {/* Round Information */}
            <div className="bg-surface rounded-lg p-6 border border-gray-700">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-accent mb-2">
                        🎰 SuiJackpot Round #{currentPool.round_number}
                    </h2>
                    <div className={`text-4xl font-mono font-bold ${isLastMinute ? 'text-danger animate-pulse' : 'text-white'}`}>
                        {formatTimeRemaining()}
                    </div>
                    {isLastMinute && (
                        <div className="text-danger font-bold mt-2 animate-pulse">
                            🔥 LAST MINUTE - 2X TICKETS! 🔥
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-background rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                            {currentPool.total_pool.toFixed(3)} SUI
                        </div>
                        <div className="text-sm text-gray-300">Prize Pool</div>
                    </div>
                    <div className="text-center p-4 bg-background rounded-lg">
                        <div className="text-2xl font-bold text-accent">
                            {currentPool.total_ticket_count}
                        </div>
                        <div className="text-sm text-gray-300">Total Tickets</div>
                    </div>
                    <div className="text-center p-4 bg-background rounded-lg">
                        <div className="text-2xl font-bold text-success">
                            {(currentPool.total_pool * 0.9).toFixed(3)} SUI
                        </div>
                        <div className="text-sm text-gray-300">Winner Prize (90%)</div>
                    </div>
                </div>
            </div>

            {/* User Stats */}
            {currentAccount && (
                <div className="bg-surface rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Your Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-background rounded-lg">
                            <div className="text-xl font-bold text-accent">
                                {userStats.tickets}
                            </div>
                            <div className="text-sm text-gray-300">Your Tickets</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg">
                            <div className="text-xl font-bold text-primary">
                                {userStats.winProbability.toFixed(2)}%
                            </div>
                            <div className="text-sm text-gray-300">Win Chance</div>
                        </div>
                        <div className="text-center p-3 bg-background rounded-lg">
                            <div className="text-xl font-bold text-white">
                                {userStats.totalSpent.toFixed(3)} SUI
                            </div>
                            <div className="text-sm text-gray-300">Total Spent</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Buy Tickets */}
            {currentAccount && isRoundActive() && (
                <div className="bg-surface rounded-lg p-6 border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4">Buy Tickets</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-2">
                                Amount (SUI) - Min: {JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000}
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min={JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000}
                                value={betAmount}
                                onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0.1)}
                                className="w-full px-3 py-2 bg-background border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div className="flex space-x-2">
                            {[0.1, 0.5, 1, 5, 10].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => setBetAmount(amount)}
                                    className="flex-1 py-2 px-3 bg-background hover:bg-gray-700 border border-gray-600 rounded-lg text-white transition-colors"
                                >
                                    {amount} SUI
                                </button>
                            ))}
                        </div>

                        <div className="text-sm text-gray-300">
                            You'll get {Math.floor(betAmount / (JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000))} 
                            {isLastMinute ? ' × 2 = ' + Math.floor(betAmount / (JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000)) * 2 : ''} 
                            tickets
                        </div>

                        <button
                            onClick={handleBuyTickets}
                            disabled={isTransacting || betAmount < (JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000)}
                            className={`w-full py-3 px-6 rounded-lg font-bold transition-colors ${
                                isTransacting || betAmount < (JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000)
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : isLastMinute
                                    ? 'bg-danger hover:bg-danger/80 text-white animate-pulse'
                                    : 'bg-primary hover:bg-primary/80 text-black'
                            }`}
                        >
                            {isTransacting ? 'Processing...' : isLastMinute ? '🔥 BUY 2X TICKETS!' : 'Buy Tickets'}
                        </button>
                    </div>
                </div>
            )}

            {/* Round Ended */}
            {isRoundEnded() && (
                <div className="bg-surface rounded-lg p-6 border border-gray-700 text-center">
                    <h3 className="text-lg font-bold text-accent mb-4">Round Ended!</h3>
                    {currentPool.winner ? (
                        <div>
                            <p className="text-white mb-2">🎉 Winner: </p>
                            <p className="font-mono text-sm text-accent break-all">
                                {currentPool.winner}
                            </p>
                            <p className="text-white mt-2">
                                Prize: {(currentPool.total_pool * 0.9).toFixed(3)} SUI
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-300">Waiting for winner to be drawn...</p>
                    )}
                </div>
            )}
        </div>
    );
}