"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Zap, Trophy, TrendingUp, Users, Clock, Gift, Star, Sparkles, DollarSign, AlertCircle } from "lucide-react";
import Link from "next/link";

// Mock data for demo
const MOCK_WINNERS = [
  { name: "Alex Chen", amount: "$125,000", time: "2 minutes ago", avatar: "AC" },
  { name: "Sarah Johnson", amount: "$87,500", time: "12 minutes ago", avatar: "SJ" },
  { name: "Mike Williams", amount: "$250,000", time: "25 minutes ago", avatar: "MW" },
  { name: "Emma Davis", amount: "$50,000", time: "45 minutes ago", avatar: "ED" },
  { name: "David Park", amount: "$175,000", time: "1 hour ago", avatar: "DP" },
];

const MOCK_PURCHASES = [
  { name: "John", tickets: 50, time: "just now" },
  { name: "Sarah", tickets: 100, time: "5 seconds ago" },
  { name: "Mike", tickets: 25, time: "12 seconds ago" },
  { name: "Emma", tickets: 200, time: "20 seconds ago" },
  { name: "Chris", tickets: 75, time: "30 seconds ago" },
];

// Sound effects helper
const playSound = (type: "purchase" | "countdown" | "win" | "bonus") => {
  // In a real implementation, you'd have actual sound files
  console.log(`Playing sound: ${type}`);
};

export default function DemoJackpotGame() {
  const [currentPool, setCurrentPool] = useState(2500000);
  const [timeLeft, setTimeLeft] = useState(72); // Start at 1:12 for dramatic effect
  const [myTickets, setMyTickets] = useState(125); // Start with some tickets
  const [totalTickets, setTotalTickets] = useState(15000);
  const [isLastMinute, setIsLastMinute] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [balance] = useState(1000); // Mock balance
  const [countdownTo2X, setCountdownTo2X] = useState<number | null>(null);
  const [isWalletConnected] = useState(true); // Mock wallet connection
  const [walletAddress] = useState("0x7a9f...8b2c"); // Mock wallet address
  const lastMinuteRef = useRef(false);

  // Auto-generate live notifications
  useEffect(() => {
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
      
      // Update pool and tickets
      setCurrentPool(prev => prev + (notification.tickets * 0.1 * 1000)); // $0.1 per ticket
      setTotalTickets(prev => prev + notification.tickets);
      
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
  }, [isLastMinute]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          handleRoundEnd();
          return 600; // Reset to 10 minutes
        }
        
        // Countdown to 2X multiplier (show countdown from 72 to 61)
        if (prev > 60 && prev <= 72) {
          const secondsTo2X = prev - 60;
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
        if (prev === 60 && !lastMinuteRef.current) {
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
        } else if (prev > 60) {
          lastMinuteRef.current = false;
          setIsLastMinute(false);
        }
        
        // Countdown beeps in last 10 seconds
        if (prev <= 10 && prev > 0) {
          playSound("countdown");
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRoundEnd = () => {
    setShowWinner(true);
    playSound("win");
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    setTimeout(() => {
      setShowWinner(false);
      // Reset for new round
      setCurrentPool(100000); // Start with seed
      setMyTickets(0);
      setTotalTickets(0);
    }, 10000);
  };

  const handleBuyTickets = (amount: number) => {
    if (amount > balance) {
      // Show insufficient balance notification
      setAchievements(prev => [...prev.slice(-4), {
        id: Date.now(),
        text: "❌ Insufficient SUI balance!",
        type: "error"
      }]);
      return;
    }
    
    const ticketCount = Math.floor(amount / 0.1);
    const multiplier = isLastMinute ? 2 : 1;
    const finalTickets = ticketCount * multiplier;
    
    setMyTickets(prev => prev + finalTickets);
    setTotalTickets(prev => prev + finalTickets);
    setCurrentPool(prev => prev + (amount * 1000)); // Convert to display currency
    
    playSound("purchase");
    
    // Show achievement
    if (finalTickets >= 100) {
      setAchievements(prev => [...prev, {
        id: Date.now(),
        text: `🎯 WHALE ALERT! You bought ${finalTickets} tickets!`,
        type: "achievement"
      }]);
    }
    
    // Show purchase confirmation
    setAchievements(prev => [...prev.slice(-4), {
      id: Date.now() + 1,
      text: `✅ Successfully purchased ${finalTickets} tickets for ${amount} SUI`,
      type: "success"
    }]);
    
    // Trigger visual feedback
    const button = document.getElementById("buy-button");
    if (button) {
      button.classList.add("animate-bounce");
      setTimeout(() => button.classList.remove("animate-bounce"), 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const winProbability = totalTickets > 0 ? (myTickets / totalTickets * 100).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F1635] to-[#1A1F3A] text-white relative overflow-hidden">
      {/* FOMO banner at the very top */}
      <AnimatePresence>
        {currentPool > 2000000 && (
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
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
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
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#FFE500] flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">SuiJackpot</h1>
            </Link>
            <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-sm">
              DEMO MODE
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/tutorial" className="hover:text-[#00D4FF] transition-colors">
              How to Play
            </Link>
            <Link href="/winners" className="hover:text-[#00D4FF] transition-colors">
              Winners
            </Link>
            <Link href="/" className="hover:text-[#00D4FF] transition-colors">
              Real Game
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isWalletConnected ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-400">Balance</p>
                  <p className="font-bold">{balance.toLocaleString()} SUI</p>
                </div>
                <div className="h-12 w-px bg-white/20 hidden sm:block" />
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all group">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium hidden sm:inline">{walletAddress}</span>
                  <span className="font-medium sm:hidden">Wallet</span>
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button className="px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Connect Wallet
              </button>
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
              <h2 className="text-2xl font-bold mb-2">Current Jackpot</h2>
              <motion.div 
                className="text-5xl font-bold gradient-text mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                key={currentPool}
              >
                ${currentPool.toLocaleString()}
              </motion.div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                <span>{totalTickets.toLocaleString()} tickets sold</span>
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
                Round Ends In
              </h3>
              <div className={`text-4xl font-bold font-mono relative z-10 ${timeLeft <= 60 ? "text-red-500 animate-pulse" : ""}`}>
                {formatTime(timeLeft)}
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

            {/* Buy tickets */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">Buy Tickets</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Amount (SUI)</label>
                  <input
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full mt-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-[#00D4FF] transition-colors"
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  {[1, 5, 10].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleBuyTickets(amount)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all hover:scale-105"
                    >
                      {amount} SUI
                    </button>
                  ))}
                </div>
                
                <button
                  id="buy-button"
                  onClick={() => handleBuyTickets(parseFloat(purchaseAmount) || 0)}
                  className={`w-full py-4 rounded-lg font-bold transition-all hover:scale-105 ${
                    isLastMinute 
                      ? "bg-gradient-to-r from-red-500 to-orange-500 animate-pulse" 
                      : "bg-gradient-to-r from-[#00D4FF] to-[#0088CC]"
                  }`}
                >
                  {isLastMinute ? "🔥 BUY NOW (2X MULTIPLIER) 🔥" : "Buy Tickets"}
                </button>
              </div>
            </div>

            {/* My stats */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold mb-4">My Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">My Tickets</span>
                  <span className="font-bold">{myTickets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Probability</span>
                  <span className="font-bold text-[#00D4FF]">{winProbability}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Potential Win</span>
                  <span className="font-bold text-[#FFE500]">
                    ${(currentPool * 0.9).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Achievements & FOMO */}
          <div className="space-y-6">
            {/* Progress milestones */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Pool Milestones
              </h2>
              <div className="space-y-3">
                {[
                  { target: 1000000, reward: "5% Bonus Pool" },
                  { target: 2500000, reward: "Mystery Box Drop" },
                  { target: 5000000, reward: "MEGA JACKPOT!" },
                ].map((milestone, index) => {
                  const progress = Math.min((currentPool / milestone.target) * 100, 100);
                  const isCompleted = currentPool >= milestone.target;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>${(milestone.target / 1000000).toFixed(1)}M</span>
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

            {/* Special offers */}
            <div className="glass-card p-6 border-2 border-[#FFE500]/50">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#FFE500]" />
                Limited Time Offer!
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-[#FFE500]/10 rounded-lg">
                  <p className="font-bold text-[#FFE500] mb-2">🎁 First Timer Bonus</p>
                  <p className="text-sm">Get 50% extra tickets on your first purchase!</p>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg">
                  <p className="font-bold text-purple-500 mb-2">👥 Refer & Earn</p>
                  <p className="text-sm">Invite friends and earn 10% lifetime commission!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Winner announcement modal */}
      <AnimatePresence>
        {showWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="glass-card p-8 max-w-md w-full text-center"
            >
              <Trophy className="w-20 h-20 mx-auto mb-4 text-[#FFE500]" />
              <h2 className="text-3xl font-bold mb-2">WINNER!</h2>
              <p className="text-xl mb-4">John Smith</p>
              <p className="text-4xl font-bold gradient-text mb-6">
                ${(currentPool * 0.9).toLocaleString()}
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-bold">
                Share on Twitter
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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