import { useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { JackpotApi } from "../apis/jackpot.api";
import { useJackpotStore } from "../stores/jackpot.store";
import { JACKPOT_CONFIG } from "../../config/jackpot";

// These will be set after contract deployment
const REGISTRY_ID =
  "0xf08234a5462b5b9e398de0e213a09f58d7b4e5e6ae7840258be0ebf057666f3e";
const CLOCK_ID = "0x6"; // Sui Clock object ID

export const useJackpot = () => {
  const currentAccount = useCurrentAccount();
  const {
    currentPool,
    registry,
    userStats,
    isLoading,
    error,
    setCurrentPool,
    setRegistry,
    setUserStats,
    setLoading,
    setError,
  } = useJackpotStore();

  // Fetch registry data
  const fetchRegistry = async () => {
    try {
      setLoading(true);
      const { data, error } = await JackpotApi.getGameRegistry(REGISTRY_ID);
      if (error) {
        setError(error);
      } else if (data) {
        setRegistry(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch registry");
    } finally {
      setLoading(false);
    }
  };

  // Fetch current pool data
  const fetchCurrentPool = async (poolId: string) => {
    try {
      setLoading(true);
      const { data, error } = await JackpotApi.getLotteryPool(poolId);
      if (error) {
        setError(error);
      } else if (data) {
        setCurrentPool(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pool");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's tickets for current pool
  const fetchUserStats = async (poolId: string, userAddress: string) => {
    try {
      const { data: tickets, error } = await JackpotApi.getUserTickets(
        poolId,
        userAddress,
      );
      if (error) {
        console.error("Error fetching user tickets:", error);
        return;
      }

      const userTickets = tickets || 0;

      // Calculate win probability
      const totalTickets = currentPool?.total_ticket_count || 0;
      const winProbability =
        totalTickets > 0 ? (userTickets / totalTickets) * 100 : 0;

      // Calculate total spent (simplified - would need to track actual purchases)
      const totalSpent =
        userTickets * (JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000);

      setUserStats({
        tickets: userTickets,
        winProbability,
        totalSpent,
      });
    } catch (err) {
      console.error("Error calculating user stats:", err);
    }
  };

  // Check if it's last minute
  const checkLastMinute = async (poolId: string): Promise<boolean> => {
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
  };

  // Auto-refresh data
  useEffect(() => {
    const refreshData = async () => {
      await fetchRegistry();
    };

    refreshData();

    // Refresh every 10 seconds
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch pool when registry changes
  useEffect(() => {
    if (registry?.current_pool_id) {
      fetchCurrentPool(registry.current_pool_id);
    }
  }, [registry?.current_pool_id]);

  // Fetch user stats when pool or user changes
  useEffect(() => {
    if (currentPool?.id && currentAccount?.address) {
      fetchUserStats(currentPool.id, currentAccount.address);
    }
  }, [currentPool?.id, currentAccount?.address]);

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

    // Helpers
    isRoundActive,
    isRoundEnded,
    getTimeRemaining,
    formatTimeRemaining,
  };
};

