import { create } from 'zustand';
import type { GameState, LotteryPool, GameRegistry, UserStats } from '../../types/jackpot';

interface JackpotStore extends GameState {
    // Actions
    setCurrentPool: (pool: LotteryPool | undefined) => void;
    setRegistry: (registry: GameRegistry | undefined) => void;
    setUserStats: (stats: UserStats) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | undefined) => void;
    reset: () => void;
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

export const useJackpotStore = create<JackpotStore>((set) => ({
    ...initialState,

    setCurrentPool: (pool) => set({ currentPool: pool }),
    
    setRegistry: (registry) => set({ registry }),
    
    setUserStats: (stats) => set({ userStats: stats }),
    
    setLoading: (loading) => set({ isLoading: loading }),
    
    setError: (error) => set({ error }),
    
    reset: () => set(initialState),
}));