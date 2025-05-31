import { useEvents } from '../core/hooks/use-events.hook';

export function ActivityFeed() {
    const { events, startListening, stopListening, getRecentActivity } = useEvents();
    const recentActivity = getRecentActivity(20);

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatAmount = (amount: number) => {
        return (amount / 1_000_000_000).toFixed(3);
    };

    const renderActivityItem = (activity: any, index: number) => {
        const { type, data } = activity;
        
        switch (type) {
            case 'ticket_purchase':
                return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-background rounded-lg">
                        <div className="text-primary">🎫</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">
                                <span className="font-mono">{formatAddress(data.buyer)}</span> bought{' '}
                                <span className="font-bold text-accent">{data.ticket_count}</span> tickets
                                {data.multiplier > 1 && (
                                    <span className="text-danger"> (×{data.multiplier})</span>
                                )}
                            </p>
                            <p className="text-xs text-gray-400">
                                {formatAmount(data.amount)} SUI • Round #{data.round_number}
                            </p>
                        </div>
                    </div>
                );

            case 'round_ended':
                return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-success/10 border border-success/30 rounded-lg">
                        <div className="text-success">🎉</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">
                                <span className="font-bold text-success">Winner!</span>{' '}
                                <span className="font-mono">{formatAddress(data.winner)}</span>
                            </p>
                            <p className="text-xs text-gray-400">
                                Won {formatAmount(data.prize_amount)} SUI • Round #{data.round_number}
                            </p>
                        </div>
                    </div>
                );

            case 'new_round':
                return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                        <div className="text-primary">🚀</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">
                                <span className="font-bold text-primary">New Round Started!</span>
                            </p>
                            <p className="text-xs text-gray-400">
                                Round #{data.round_number} • Seed: {formatAmount(data.seed_amount)} SUI
                            </p>
                        </div>
                    </div>
                );

            case 'airdrop':
                return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                        <div className="text-accent">💰</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">
                                <span className="font-bold text-accent">Airdrop!</span>{' '}
                                {data.recipients.length} players received rewards
                            </p>
                            <p className="text-xs text-gray-400">
                                {formatAmount(data.amount_per_recipient)} SUI each • Round #{data.round_number}
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-surface rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Live Activity</h3>
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${events.isListening ? 'bg-success animate-pulse' : 'bg-gray-500'}`}></div>
                    <span className="text-xs text-gray-400">
                        {events.isListening ? 'Live' : 'Offline'}
                    </span>
                    {!events.isListening && (
                        <button
                            onClick={startListening}
                            className="text-xs px-2 py-1 bg-primary hover:bg-primary/80 text-black rounded transition-colors"
                        >
                            Start
                        </button>
                    )}
                    {events.isListening && (
                        <button
                            onClick={stopListening}
                            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                        >
                            Stop
                        </button>
                    )}
                </div>
            </div>

            <div className="h-64 overflow-y-auto space-y-2">
                {events.error && (
                    <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg">
                        <p className="text-danger text-sm">Error: {events.error}</p>
                    </div>
                )}

                {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400">No recent activity</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Activity will appear here when the contract is deployed
                        </p>
                    </div>
                ) : (
                    recentActivity.map(renderActivityItem)
                )}
            </div>

            <div className="mt-4 text-xs text-gray-400 text-center">
                Showing last 20 activities • Updates every 5 seconds
            </div>
        </div>
    );
}