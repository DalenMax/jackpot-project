import { useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useJackpotStore } from "../stores/jackpot.store";
import { JACKPOT_CONFIG } from "../../config/jackpot";

export const useJackpot = () => {
  const currentAccount = useCurrentAccount();
  
  // Use stable selectors to get state and actions
  const currentPool = useJackpotStore((state) => state.currentPool);
  const registry = useJackpotStore((state) => state.registry);
  const userStats = useJackpotStore((state) => state.userStats);
  const isLoading = useJackpotStore((state) => state.isLoading);
  const error = useJackpotStore((state) => state.error);
  
  // Get stable action references
  const fetchRegistry = useJackpotStore((state) => state.fetchRegistry);
  const fetchCurrentPool = useJackpotStore((state) => state.fetchCurrentPool);
  const fetchUserStats = useJackpotStore((state) => state.fetchUserStats);
  const checkLastMinute = useJackpotStore((state) => state.checkLastMinute);
  const startAutoRefresh = useJackpotStore((state) => state.startAutoRefresh);
  const stopAutoRefresh = useJackpotStore((state) => state.stopAutoRefresh);
  const discoverAndLoadLatestPool = useJackpotStore((state) => state.discoverAndLoadLatestPool);

  // Start auto-refresh when component mounts (no dependencies to prevent re-runs)
  useEffect(() => {
    startAutoRefresh();
    return () => stopAutoRefresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch pool when registry changes (only depend on the data, not the function)
  useEffect(() => {
    if (registry?.current_pool_id) {
      console.log('🎯 Registry updated with pool ID:', registry.current_pool_id);
      fetchCurrentPool(); // No need to pass poolId, it will get it from registry
    } else if (registry && !registry.current_pool_id) {
      console.log('⚠️ Registry loaded but no current pool - attempting discovery');
      discoverAndLoadLatestPool();
    }
  }, [registry?.current_pool_id, registry]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch user stats when pool or user changes (only depend on the data, not the function)
  useEffect(() => {
    if (currentPool?.id && currentAccount?.address) {
      fetchUserStats(currentPool.id, currentAccount.address);
    }
  }, [currentPool?.id, currentAccount?.address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper functions
  const isRoundActive = (): boolean => {
    return currentPool?.state === JACKPOT_CONFIG.STATE_ACTIVE;
  };

  const isRoundEnded = (): boolean => {
    if (!currentPool) return false;
    const now = Date.now();
    return (
      now >= currentPool.end_time ||
      currentPool.state !== JACKPOT_CONFIG.STATE_ACTIVE
    );
  };

  const getTimeRemaining = (): number => {
    if (!currentPool) return 0;
    const now = Date.now();
    return Math.max(0, currentPool.end_time - now);
  };

  const formatTimeRemaining = (): string => {
    const remaining = getTimeRemaining();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return {
    // State
    currentPool,
    registry,
    userStats,
    isLoading,
    error,

    // Actions
    fetchRegistry,
    fetchCurrentPool,
    fetchUserStats,
    checkLastMinute,
    discoverAndLoadLatestPool,

    // Helpers
    isRoundActive,
    isRoundEnded,
    getTimeRemaining,
    formatTimeRemaining,
  };
};