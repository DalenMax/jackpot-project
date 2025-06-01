import { create } from 'zustand';
import { JackpotApi } from '../apis/jackpot.api';
import { JACKPOT_CONFIG } from '../../config/jackpot';
import { PoolDiscovery } from '../utils/pool-discovery';
import type { GameState, LotteryPool, GameRegistry, UserStats } from '../../types/jackpot';

// Use configuration from environment
const REGISTRY_ID = JACKPOT_CONFIG.GAME_REGISTRY;
const CLOCK_ID = "0x6"; // Sui Clock object ID

interface JackpotStore extends GameState {
    // Actions
    setCurrentPool: (pool: LotteryPool | undefined) => void;
    setRegistry: (registry: GameRegistry | undefined) => void;
    setUserStats: (stats: UserStats) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | undefined) => void;
    reset: () => void;
    
    // API Actions
    fetchRegistry: () => Promise<void>;
    fetchCurrentPool: (poolId?: string) => Promise<void>;
    fetchUserStats: (poolId: string, userAddress: string) => Promise<void>;
    checkLastMinute: (poolId: string) => Promise<boolean>;
    startAutoRefresh: () => void;
    stopAutoRefresh: () => void;
    discoverAndLoadLatestPool: () => Promise<void>;
}

const initialUserStats: UserStats = {
    tickets: 0,
    winProbability: 0,
    totalSpent: 0,
};

const initialState: GameState = {
    currentPool: undefined,
    registry: undefined,
    userStats: initialUserStats,
    isLoading: false,
    error: undefined,
};

let autoRefreshInterval: NodeJS.Timeout | null = null;
let isRequesting = false;

export const useJackpotStore = create<JackpotStore>((set, get) => ({
    ...initialState,

    setCurrentPool: (pool) => set((state) => 
        state.currentPool !== pool ? { currentPool: pool } : state
    ),
    
    setRegistry: (registry) => set((state) => 
        state.registry !== registry ? { registry } : state
    ),
    
    setUserStats: (stats) => set((state) => 
        JSON.stringify(state.userStats) !== JSON.stringify(stats) ? { userStats: stats } : state
    ),
    
    setLoading: (loading) => set((state) => 
        state.isLoading !== loading ? { isLoading: loading } : state
    ),
    
    setError: (error) => set((state) => 
        state.error !== error ? { error } : state
    ),
    
    reset: () => set(initialState),

    // API Actions
    fetchRegistry: async () => {
        if (isRequesting) return;
        
        try {
            isRequesting = true;
            const { setLoading, setError, setRegistry } = get();
            setLoading(true);
            
            console.log('🔍 Fetching registry from:', REGISTRY_ID);
            const { data, error } = await JackpotApi.getGameRegistry(REGISTRY_ID);
            console.log('📡 Registry response:', { data, error });
            
            if (error) {
                console.error('❌ Registry error:', error);
                setError(error);
            } else if (data) {
                console.log('✅ Registry data loaded:', data);
                setRegistry(data);
            }
        } catch (err) {
            console.error('💥 Registry fetch failed:', err);
            const { setError } = get();
            setError(err instanceof Error ? err.message : "Failed to fetch registry");
        } finally {
            const { setLoading } = get();
            setLoading(false);
            isRequesting = false;
        }
    },

    fetchCurrentPool: async (poolId?: string) => {
        try {
            const { setLoading, setError, setCurrentPool, registry } = get();
            setLoading(true);
            
            // If no poolId provided, use the one from registry
            const targetPoolId = poolId || registry?.current_pool_id;
            
            if (!targetPoolId) {
                console.warn('⚠️ No pool ID available - registry may not be loaded yet');
                return;
            }
            
            console.log('🎱 Fetching pool from:', targetPoolId);
            const { data, error } = await JackpotApi.getLotteryPool(targetPoolId);
            console.log('🎯 Pool response:', { data, error });
            
            if (error) {
                console.error('❌ Pool error:', error);
                setError(error);
            } else if (data) {
                console.log('✅ Pool data loaded:', data);
                setCurrentPool(data);
            }
        } catch (err) {
            console.error('💥 Pool fetch failed:', err);
            const { setError } = get();
            setError(err instanceof Error ? err.message : "Failed to fetch pool");
        } finally {
            const { setLoading } = get();
            setLoading(false);
        }
    },

    fetchUserStats: async (poolId: string, userAddress: string) => {
        try {
            const { currentPool, setUserStats } = get();
            
            const { data: tickets, error } = await JackpotApi.getUserTickets(poolId, userAddress);
            if (error) {
                console.error("Error fetching user tickets:", error);
                return;
            }

            const userTickets = tickets || 0;
            const totalTickets = currentPool?.total_ticket_count || 0;
            const winProbability = totalTickets > 0 ? (userTickets / totalTickets) * 100 : 0;
            const totalSpent = userTickets * (JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000);

            setUserStats({
                tickets: userTickets,
                winProbability,
                totalSpent,
            });
        } catch (err) {
            console.error("Error calculating user stats:", err);
        }
    },

    checkLastMinute: async (poolId: string): Promise<boolean> => {
        try {
            const { data, error } = await JackpotApi.isLastMinute(poolId, CLOCK_ID);
            if (error) {
                console.error("Error checking last minute:", error);
                return false;
            }
            return data || false;
        } catch (err) {
            console.error("Error checking last minute:", err);
            return false;
        }
    },

    startAutoRefresh: () => {
        const { fetchRegistry } = get();
        
        // Initial fetch
        fetchRegistry();
        
        // Set up interval (30 seconds)
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
        }
        autoRefreshInterval = setInterval(fetchRegistry, 30000);
    },

    stopAutoRefresh: () => {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
    },

    discoverAndLoadLatestPool: async () => {
        try {
            console.log('🔍 Discovering latest pool...');
            const { setLoading, setError, setCurrentPool } = get();
            setLoading(true);
            
            const result = await PoolDiscovery.findLatestPool();
            
            if (result) {
                console.log('✅ Pool discovered:', result.poolId);
                
                // Load the pool data using our API
                const { data, error } = await JackpotApi.getLotteryPool(result.poolId);
                
                if (error) {
                    setError(`Pool discovery failed: ${error}`);
                } else if (data) {
                    setCurrentPool(data);
                    console.log('🎯 Latest pool loaded successfully');
                }
            } else {
                setError('No active pool found on any network');
            }
        } catch (err) {
            console.error('💥 Pool discovery failed:', err);
            const { setError } = get();
            setError(err instanceof Error ? err.message : "Failed to discover pool");
        } finally {
            const { setLoading } = get();
            setLoading(false);
        }
    },
}));