"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Zap, Trophy, TrendingUp, Users, Clock, Gift, Star, Sparkles, DollarSign, AlertCircle } from "lucide-react";
import Link from "next/link";
import { SuiJackpotLogo } from './sui-jackpot-logo';
import { useCurrentAccount, useSuiClientQuery, useDisconnectWallet, ConnectButton, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { useJackpot } from '../core/hooks/use-jackpot.hook';
import { JACKPOT_CONFIG } from '../config/jackpot';

// Sound effects helper
const playSound = (type: "purchase" | "countdown" | "win" | "bonus") => {
  // In a real implementation, you'd have actual sound files
  console.log(`Playing sound: ${type}`);
};

export function JackpotGame() {
  const {
    currentPool,
    registry,
    userStats,
    isLoading,
    error,
    isRoundActive,
    formatTimeRemaining,
  } = useJackpot();

  // Enhanced state for dramatic effects
  const [isLastMinute, setIsLastMinute] = useState(false);
  const [countdownTo2X, setCountdownTo2X] = useState<number | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  // Real wallet connection
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const isWalletConnected = !!currentAccount;
  const walletAddress = currentAccount?.address 
    ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
    : "";

  // Get wallet balance
  const { data: balance } = useSuiClientQuery(
    'getBalance',
    { owner: currentAccount?.address || '' },
    { enabled: !!currentAccount?.address }
  );

  const suiBalance = balance ? 
    (parseInt(balance.totalBalance) / 1_000_000_000).toFixed(2) : "0.00";

  // Handle wallet disconnect
  const handleDisconnect = () => {
    disconnect();
  };

  // State for dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Purchase state
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  // Transaction hook and SUI client
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // Buy tickets function
  const handleBuyTickets = async (amount: number) => {
    if (!currentAccount || !currentPool) {
      setAchievements(prev => [...prev.slice(-4), {
        id: Date.now(),
        text: "❌ Please connect your wallet first!",
        type: "error"
      }]);
      return;
    }

    if (amount <= 0) {
      setAchievements(prev => [...prev.slice(-4), {
        id: Date.now(),
        text: "❌ Please enter a valid amount!",
        type: "error"
      }]);
      return;
    }

    if (amount < JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000) {
      setAchievements(prev => [...prev.slice(-4), {
        id: Date.now(),
        text: `❌ Minimum bet is ${JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000} SUI!`,
        type: "error"
      }]);
      return;
    }

    const amountInMist = Math.floor(amount * 1_000_000_000);
    const availableBalance = balance ? parseInt(balance.totalBalance) : 0;

    if (amountInMist > availableBalance) {
      setAchievements(prev => [...prev.slice(-4), {
        id: Date.now(),
        text: "❌ Insufficient SUI balance!",
        type: "error"
      }]);
      return;
    }

    setIsPurchasing(true);

    try {
      // Import the JackpotApi to use the proper transaction builder
      const { JackpotApi } = await import('../core/apis/jackpot.api');
      
      // Use the current pool ID from the registry we already have
      if (!registry?.current_pool_id) {
        setAchievements(prev => [...prev.slice(-4), {
          id: Date.now(),
          text: "❌ Could not find active pool. Please try again.",
          type: "error"
        }]);
        setIsPurchasing(false);
        return;
      }

      const currentPoolId = registry.current_pool_id;
      console.log('🎯 Using current pool ID from registry:', currentPoolId);
      console.log('📋 Current pool object ID:', currentPool?.id);
      console.log('📋 Pool ID validation:', {
        registryPoolId: currentPoolId,
        currentPoolObjectId: currentPool?.id,
        idsMatch: currentPoolId === currentPool?.id,
        bothExist: !!(currentPoolId && currentPool?.id)
      });
      
      console.log('📋 Transaction parameters:', {
        gameRegistry: JACKPOT_CONFIG.GAME_REGISTRY,
        poolId: currentPoolId,
        amount,
        clockId: '0x6'
      });
      
      // Validate all required parameters
      if (!currentPoolId || !JACKPOT_CONFIG.GAME_REGISTRY) {
        setAchievements(prev => [...prev.slice(-4), {
          id: Date.now(),
          text: "❌ Missing required configuration. Please try again.",
          type: "error"
        }]);
        setIsPurchasing(false);
        return;
      }

      // Validate that the current pool object matches the registry's current pool
      if (currentPool?.id !== currentPoolId) {
        setAchievements(prev => [...prev.slice(-4), {
          id: Date.now(),
          text: "❌ Pool data out of sync. Refreshing...",
          type: "error"
        }]);
        setIsPurchasing(false);
        console.log('🔄 Pool ID mismatch, triggering refresh...');
        // Trigger a refresh to get the correct pool
        setTimeout(() => window.location.reload(), 1000);
        return;
      }
      
      // Build the transaction using the proper API with the registry's current pool ID
      const transaction = JackpotApi.createBuyTicketsTx(
        JACKPOT_CONFIG.GAME_REGISTRY,
        currentPoolId,
        amount, // amount in SUI
        '0x6' // Clock object ID on Sui
      );

      console.log('📝 Transaction object created:', transaction);

      // Try building the transaction again with different settings
      console.log('🔄 Attempting transaction execution...');
      
      signAndExecute(
        {
          transaction,
        }, 
        {
          onSuccess: (result) => {
            console.log('✅ Transaction successful:', result);
            playSound("purchase");
            
            const ticketsEstimate = Math.floor(amount / 0.1);
            const multiplier = isLastMinute ? 2 : 1;
            const finalTickets = ticketsEstimate * multiplier;

            setAchievements(prev => [...prev.slice(-4), {
              id: Date.now(),
              text: `✅ Successfully bought ~${finalTickets} tickets for ${amount} SUI!`,
              type: "success"
            }]);

            if (finalTickets >= 100) {
              setAchievements(prev => [...prev.slice(-4), {
                id: Date.now() + 1,
                text: `🎯 WHALE ALERT! You bought ${finalTickets} tickets!`,
                type: "whale"
              }]);
            }

            setPurchaseAmount("");
            setIsPurchasing(false);
          },
          onError: (error) => {
            console.error('❌ Transaction failed:', error);
            console.error('❌ Error details:', {
              message: error.message,
              stack: error.stack,
              cause: error.cause
            });
            
            setAchievements(prev => [...prev.slice(-4), {
              id: Date.now(),
              text: `❌ Transaction failed: ${error.message || 'Unknown error'}`,
              type: "error"
            }]);
            setIsPurchasing(false);
          }
        }
      );

    } catch (error) {
      console.error('Error building transaction:', error);
      setAchievements(prev => [...prev.slice(-4), {
        id: Date.now(),
        text: "❌ Failed to build transaction. Please try again.",
        type: "error"
      }]);
      setIsPurchasing(false);
    }
  };
  const lastMinuteRef = useRef(false);

  // Mock data for live activity (would come from real backend)
  const MOCK_PURCHASES = [
    { name: "John", tickets: 50, time: "just now" },
    { name: "Sarah", tickets: 100, time: "5 seconds ago" },
    { name: "Mike", tickets: 25, time: "12 seconds ago" },
    { name: "Emma", tickets: 200, time: "20 seconds ago" },
    { name: "Chris", tickets: 75, time: "30 seconds ago" },
  ];

  const MOCK_WINNERS = [
    { name: "Alex Chen", amount: "$125,000", time: "2 minutes ago", avatar: "AC" },
    { name: "Sarah Johnson", amount: "$87,500", time: "12 minutes ago", avatar: "SJ" },
    { name: "Mike Williams", amount: "$250,000", time: "25 minutes ago", avatar: "MW" },
    { name: "Emma Davis", amount: "$50,000", time: "45 minutes ago", avatar: "ED" },
    { name: "David Park", amount: "$175,000", time: "1 hour ago", avatar: "DP" },
  ];

  // Parse time remaining for enhanced effects
  const timeRemaining = formatTimeRemaining();
  const timeInSeconds = parseTimeToSeconds(timeRemaining);

  function parseTimeToSeconds(timeString: string): number {
    if (!timeString || timeString === "00:00") return 0;
    const parts = timeString.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  }

  // Enhanced timer effects
  useEffect(() => {
    if (!isRoundActive()) return;

    // Countdown to 2X multiplier (show countdown from 72 to 61)
    if (timeInSeconds > 60 && timeInSeconds <= 72) {
      const secondsTo2X = timeInSeconds - 60;
      setCountdownTo2X(secondsTo2X);
      
      // Show countdown alerts at key moments
      if (secondsTo2X === 12 || secondsTo2X === 10 || secondsTo2X === 5 || secondsTo2X === 3) {
        setAchievements(prev => [...prev.slice(-4), {
          id: Date.now(),
          text: `⏰ 2X MULTIPLIER ACTIVATING IN ${secondsTo2X} SECONDS!`,
          type: "countdown"
        }]);
        playSound("countdown");
      }
    } else {
      setCountdownTo2X(null);
    }
    
    // Check for last minute
    if (timeInSeconds === 60 && !lastMinuteRef.current) {
      lastMinuteRef.current = true;
      setIsLastMinute(true);
      playSound("bonus");
      
      // Multiple dramatic announcements
      const urgentMessages = [
        "🔥 FINAL MINUTE! 2X MULTIPLIER ACTIVE!",
        "⚡ DOUBLE YOUR TICKETS NOW!",
        "🚨 LAST CHANCE FOR 2X BONUS!",
        "💰 JACKPOT CLOSING SOON!"
      ];
      
      urgentMessages.forEach((msg, index) => {
        setTimeout(() => {
          setAchievements(prev => [...prev.slice(-5), {
            id: Date.now() + index,
            text: msg,
            type: index === 0 ? "bonus" : "urgent"
          }]);
        }, index * 500);
      });
    } else if (timeInSeconds > 60) {
      lastMinuteRef.current = false;
      setIsLastMinute(false);
    }
  }, [timeInSeconds, isRoundActive]);

  // Auto-generate live notifications
  useEffect(() => {
    if (!isRoundActive()) return;

    const generateNotification = () => {
      const names = ["John", "Sarah", "Mike", "Emma", "Chris", "Lisa", "David", "Anna", "Tom", "Kate", "James", "Sophie"];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const baseTickets = isLastMinute ? 100 + Math.floor(Math.random() * 300) : 25 + Math.floor(Math.random() * 75);
      
      const notification = {
        id: Date.now() + Math.random(),
        name: randomName,
        tickets: baseTickets,
        timestamp: new Date().toLocaleTimeString(),
        isWhale: baseTickets > 200,
      };
      
      setLiveNotifications(prev => [notification, ...prev].slice(0, isLastMinute ? 10 : 5));
      
      // Add whale alerts during last minute
      if (isLastMinute && notification.isWhale) {
        setAchievements(prev => [...prev.slice(-4), {
          id: Date.now(),
          text: `🐋 WHALE ALERT! ${notification.name} bought ${notification.tickets} tickets for 2X!`,
          type: "whale"
        }]);
      }
    };

    // More frequent notifications during last minute
    const interval = setInterval(() => {
      generateNotification();
      if (isLastMinute) {
        // Extra notification surge during last minute
        setTimeout(() => generateNotification(), 500);
        setTimeout(() => generateNotification(), 1000);
      }
    }, isLastMinute ? 1000 : 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [isLastMinute, isRoundActive]);

  // Everyone can see the game, but wallet features are limited when not connected

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0E27] via-[#0F1635] to-[#1A1F3A]">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-[#FFE500] border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-[#00D4FF] border-t-transparent animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F1635] to-[#1A1F3A] text-white flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-red-400 mb-4 text-4xl">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Link href="/example" className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Try Demo Instead
          </Link>
        </div>
      </div>
    );
  }

  if (!currentPool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F1635] to-[#1A1F3A] text-white flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-yellow-400 mb-4 text-4xl">🎲</div>
          <h2 className="text-xl font-bold mb-2">No Active Round</h2>
          <p className="text-gray-300 mb-4">No active jackpot round found. Please check back soon!</p>
          <Link href="/example" className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Try Demo
          </Link>
        </div>
      </div>
    );
  }

  const poolValue = currentPool.total_pool ? currentPool.total_pool * 1000 : 0; // Convert to display format

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F1635] to-[#1A1F3A] text-white relative overflow-hidden">
      {/* FOMO banner at the very top */}
      <AnimatePresence>
        {poolValue > 2000000 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white overflow-hidden relative z-50"
          >
            <div className="p-3 text-center">
              <p className="font-bold flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                JACKPOT ALERT! Pool is over $2M - Don't miss out!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
            }}
            animate={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
            }}
            transition={{ 
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SuiJackpotLogo />
            <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-sm">
              LIVE
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/tutorial" className="hover:text-[#00D4FF] transition-colors">
              How to Play
            </Link>
            <Link href="/winners" className="hover:text-[#00D4FF] transition-colors">
              Winners
            </Link>
            <Link href="/example" className="hover:text-[#00D4FF] transition-colors">
              Demo
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isWalletConnected ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-400">Balance</p>
                  <p className="font-bold">{suiBalance} SUI</p>
                </div>
                <div className="h-12 w-px bg-white/20 hidden sm:block" />
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-medium hidden sm:inline">{walletAddress}</span>
                    <span className="font-medium sm:hidden">Connected</span>
                    <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <ConnectButton />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Previous winners */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FFE500]" />
                Recent Winners
              </h2>
              <div className="space-y-3">
                {MOCK_WINNERS.map((winner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#FFE500] flex items-center justify-center font-bold">
                      {winner.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{winner.name}</p>
                      <p className="text-sm text-gray-400">{winner.time}</p>
                    </div>
                    <p className="font-bold text-[#FFE500]">{winner.amount}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Live activity ticker */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00D4FF]" />
                Live Activity
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {liveNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="flex items-center gap-2 text-sm p-2 bg-[#00D4FF]/10 rounded-lg"
                    >
                      <Sparkles className="w-4 h-4 text-[#00D4FF]" />
                      <span className="font-semibold">{notification.name}</span>
                      <span>just bought</span>
                      <span className="font-bold text-[#00D4FF]">{notification.tickets} tickets!</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Center column - Main game */}
          <div className="space-y-6">
            {/* Prize pool */}
            <motion.div 
              className={`glass-card p-8 text-center relative overflow-hidden ${isLastMinute ? "animate-pulse-glow" : ""}`}
              animate={{ scale: isLastMinute ? [1, 1.02, 1] : 1 }}
              transition={{ repeat: isLastMinute ? Infinity : 0, duration: 2 }}
            >
              {isLastMinute && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 animate-pulse" />
              )}
              <h2 className="text-2xl font-bold mb-2 relative z-10">Current Jackpot</h2>
              <motion.div 
                className="text-5xl font-bold gradient-text mb-4 relative z-10"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                key={poolValue}
              >
                {currentPool.total_pool.toFixed(2)} SUI
              </motion.div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400 relative z-10">
                <Users className="w-4 h-4" />
                <span>Round #{currentPool.round_number}</span>
              </div>
            </motion.div>

            {/* Timer */}
            <div className={`glass-card p-6 text-center relative overflow-hidden ${isLastMinute ? "border-2 border-red-500" : ""}`}>
              {isLastMinute && (
                <>
                  {/* Burning background effect */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-500 animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/20 to-red-600/40 animate-pulse" />
                  </div>
                  {/* Animated fire particles */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-orange-400 rounded-full"
                      initial={{ 
                        bottom: 0,
                        left: `${Math.random() * 100}%`,
                        opacity: 0
                      }}
                      animate={{ 
                        bottom: "100%",
                        opacity: [0, 1, 0],
                      }}
                      transition={{ 
                        duration: 2 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 2
                      }}
                    />
                  ))}
                </>
              )}
              
              <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2 relative z-10">
                <Clock className="w-5 h-5" />
                {isRoundActive() ? "Round Ends In" : "Round Ended"}
              </h3>
              <div className={`text-4xl font-bold font-mono relative z-10 ${timeInSeconds <= 60 ? "text-red-500 animate-pulse" : ""}`}>
                {timeRemaining}
              </div>
              
              {/* Countdown to 2X */}
              {countdownTo2X !== null && !isLastMinute && (
                <motion.div 
                  className="mt-4 p-3 bg-orange-500/20 border border-orange-500 rounded-lg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <motion.p 
                    className="text-2xl font-bold text-orange-500"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    2X MULTIPLIER IN {countdownTo2X}s
                  </motion.p>
                  <div className="mt-2 flex justify-center gap-1">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i < (12 - countdownTo2X) 
                            ? "bg-orange-500 scale-125" 
                            : "bg-orange-500/30"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              
              {isLastMinute && (
                <motion.div 
                  className="mt-4 p-4 relative z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <div className="relative">
                    {/* Burning 2X text */}
                    <motion.div
                      className="text-6xl font-black text-center mb-2"
                      animate={{ 
                        textShadow: [
                          "0 0 20px #ff0000, 0 0 40px #ff6600, 0 0 60px #ffaa00",
                          "0 0 30px #ff0000, 0 0 50px #ff6600, 0 0 70px #ffaa00",
                          "0 0 20px #ff0000, 0 0 40px #ff6600, 0 0 60px #ffaa00"
                        ]
                      }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      style={{ 
                        background: "linear-gradient(to top, #ff0000, #ff6600, #ffaa00, #ffff00)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        filter: "drop-shadow(0 2px 10px rgba(255, 0, 0, 0.8))"
                      }}
                    >
                      2X
                    </motion.div>
                    <p className="font-bold text-white text-xl animate-pulse">MULTIPLIER ACTIVE!</p>
                    <p className="text-sm text-white/90 mt-1">All tickets count DOUBLE!</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Stats */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">My Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">My Tickets</span>
                  <span className="font-bold">{userStats.tickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Probability</span>
                  <span className="font-bold text-[#00D4FF]">{userStats.winProbability.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Spent</span>
                  <span className="font-bold">{userStats.totalSpent.toFixed(2)} SUI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Potential Win</span>
                  <span className="font-bold text-[#FFE500]">
                    {(currentPool.total_pool * 0.9).toFixed(2)} SUI
                  </span>
                </div>
              </div>
            </div>

            {/* Buy Tickets */}
            {isRoundActive() && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Buy Tickets</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Minimum bet: {JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000} SUI
                </p>
                
                {isWalletConnected ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Amount (SUI)</label>
                      <input
                        type="number"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        placeholder="Enter amount..."
                        min={JACKPOT_CONFIG.MINIMUM_BET / 1_000_000_000}
                        step="0.1"
                        disabled={isPurchasing}
                        className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-[#00D4FF] transition-colors disabled:opacity-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ~{purchaseAmount ? Math.floor(parseFloat(purchaseAmount) / 0.1) * (isLastMinute ? 2 : 1) : 0} tickets
                        {isLastMinute && " (2X MULTIPLIER ACTIVE!)"}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 5, 10].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setPurchaseAmount(amount.toString())}
                          disabled={isPurchasing}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        >
                          {amount} SUI
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleBuyTickets(parseFloat(purchaseAmount) || 0)}
                      disabled={isPurchasing || !purchaseAmount || parseFloat(purchaseAmount) <= 0}
                      className={`w-full py-4 rounded-lg font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 ${
                        isLastMinute 
                          ? "bg-gradient-to-r from-red-500 to-orange-500 animate-pulse" 
                          : "bg-gradient-to-r from-[#00D4FF] to-[#0088CC]"
                      }`}
                    >
                      {isPurchasing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {isLastMinute ? "🔥 BUY NOW (2X MULTIPLIER) 🔥" : "Buy Tickets"}
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <Link 
                        href="/example" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition-colors text-sm"
                      >
                        Try Demo Version
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-center">
                    <p className="text-blue-300 text-sm mb-4">
                      🔗 Connect your wallet to purchase tickets
                    </p>
                    <ConnectButton />
                    <div className="mt-3">
                      <Link 
                        href="/example" 
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg font-semibold hover:bg-white/20 transition-colors text-sm"
                      >
                        Or Try Demo Version
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column - Achievements & Pool Info */}
          <div className="space-y-6">
            {/* Progress milestones */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Pool Milestones
              </h2>
              <div className="space-y-3">
                {[
                  { target: 1000, reward: "5% Bonus Pool" },
                  { target: 2500, reward: "Mystery Box Drop" },
                  { target: 5000, reward: "MEGA JACKPOT!" },
                ].map((milestone, index) => {
                  const progress = Math.min((currentPool.total_pool / milestone.target) * 100, 100);
                  const isCompleted = currentPool.total_pool >= milestone.target;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{milestone.target} SUI</span>
                        <span className={isCompleted ? "text-green-500" : "text-gray-400"}>
                          {milestone.reward}
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${isCompleted ? "bg-green-500" : "bg-gradient-to-r from-[#00D4FF] to-[#FFE500]"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements feed */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[#FFE500]" />
                Live Achievements
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {achievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`p-3 rounded-lg text-sm font-semibold text-center ${
                        achievement.type === "bonus" 
                          ? "bg-red-500/20 text-red-500 border border-red-500 animate-pulse" 
                          : achievement.type === "urgent"
                          ? "bg-orange-500/20 text-orange-500 border border-orange-500 animate-bounce"
                          : achievement.type === "whale"
                          ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500"
                          : achievement.type === "countdown"
                          ? "bg-purple-500/20 text-purple-500 border border-purple-500 animate-pulse"
                          : achievement.type === "success"
                          ? "bg-green-500/20 text-green-500 border border-green-500"
                          : achievement.type === "error"
                          ? "bg-red-500/20 text-red-500 border border-red-500"
                          : "bg-[#FFE500]/20 text-[#FFE500] border border-[#FFE500]"
                      }`}
                    >
                      {achievement.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Pool Info */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4">Pool Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Tickets:</span>
                  <span className="font-semibold">{currentPool.total_ticket_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Winner Prize:</span>
                  <span className="font-semibold">{JACKPOT_CONFIG.WINNER_PERCENTAGE}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Airdrop Pool:</span>
                  <span className="font-semibold">{JACKPOT_CONFIG.AIRDROP_PERCENTAGE}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Round Duration:</span>
                  <span className="font-semibold">{JACKPOT_CONFIG.ROUND_DURATION_MS / 60000} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Dropdown Menu - Fixed Position */}
      {showDropdown && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown menu */}
          <div 
            className="fixed top-20 right-4 w-48 bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg z-[9999] shadow-2xl"
            style={{
              animation: 'fadeInUp 0.2s ease-out'
            }}
          >
            <div className="p-3 border-b border-white/10">
              <p className="text-sm text-gray-400">Wallet</p>
              <p className="text-sm font-medium">{walletAddress}</p>
              <p className="text-sm text-gray-400">Balance: {suiBalance} SUI</p>
            </div>
            <button
              onClick={() => {
                handleDisconnect();
                setShowDropdown(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Disconnect Wallet
            </button>
          </div>
        </>
      )}

      {/* Floating notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-40 max-h-[60vh] overflow-hidden">
        <AnimatePresence>
          {liveNotifications.slice(0, isLastMinute ? 8 : 3).map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card p-3 flex items-center gap-2 min-w-[300px] ${
                notification.isWhale ? "border-2 border-yellow-500 bg-yellow-500/10" : ""
              } ${isLastMinute ? "animate-pulse" : ""}`}
            >
              {notification.isWhale ? (
                <Sparkles className="w-5 h-5 text-yellow-500" />
              ) : (
                <DollarSign className="w-5 h-5 text-[#00D4FF]" />
              )}
              <p className="text-sm">
                <span className="font-bold">{notification.name}</span> bought{" "}
                <span className={`font-bold ${notification.isWhale ? "text-yellow-500" : "text-[#00D4FF]"}`}>
                  {notification.tickets} tickets
                </span>
                {isLastMinute && " for 2X!"}
                {notification.isWhale && " 🐋"}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}