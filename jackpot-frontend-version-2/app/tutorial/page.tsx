"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Zap, Trophy, Users, TrendingUp, Gift, Shield, Sparkles, Play } from "lucide-react";
import Link from "next/link";

export default function TutorialPage() {
  const steps = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Connect Your Wallet",
      description: "Start by connecting your Sui wallet. It's quick, secure, and gives you access to the game.",
      tips: ["Make sure you have some SUI tokens", "We recommend at least 10 SUI to start"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Buy Your Tickets",
      description: "Each ticket costs 0.1 SUI. The more tickets you buy, the higher your chances!",
      tips: ["Quick buy options: 1, 5, or 10 SUI", "Enter custom amounts for bigger plays"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Watch the Timer",
      description: "Each round lasts exactly 10 minutes. The excitement builds as time runs out!",
      tips: ["Pool grows in real-time", "Final minute countdown is intense"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "2X Multiplier Madness",
      description: "In the final 60 seconds, all tickets count DOUBLE! This is when things get wild.",
      tips: ["Watch for the burning 2X effect", "Many winners buy in the last minute"],
      color: "from-red-500 to-orange-500"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Winner Takes 90%",
      description: "One lucky winner takes 90% of the entire pool. Could be you!",
      tips: ["Winners are chosen by blockchain randomness", "100% transparent and verifiable"],
      color: "from-yellow-500 to-amber-500"
    }
  ];

  const strategies = [
    {
      name: "The Early Bird",
      description: "Buy tickets early when the pool is smaller. Your win probability is higher!",
      winRate: "Higher probability",
      risk: "Smaller prize pool"
    },
    {
      name: "The Final Rush",
      description: "Wait for the 2X multiplier in the last minute. Double your tickets instantly!",
      winRate: "2X ticket value",
      risk: "Higher competition"
    },
    {
      name: "The Steady Player",
      description: "Buy tickets throughout the round. Balance your risk and opportunity.",
      winRate: "Balanced approach",
      risk: "Moderate all around"
    },
    {
      name: "The Whale",
      description: "Go big with large purchases. Dominate the pool with sheer volume.",
      winRate: "Highest probability",
      risk: "Largest investment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F1635] to-[#1A1F3A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#FFE500] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">SuiJackpot</h1>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/example" className="hover:text-[#00D4FF] transition-colors">Play Demo</Link>
            <Link href="/winners" className="hover:text-[#00D4FF] transition-colors">Winners</Link>
            <Link href="/" className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Play Now
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            How to Play & Win
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Master the game in 5 simple steps. Your journey to the jackpot starts here!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link 
              href="/example" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-bold text-lg hover:scale-105 transition-transform"
            >
              <Play className="w-5 h-5" />
              Try Demo Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Game Steps</h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Step {index + 1}: {step.title}</h3>
                  <p className="text-gray-300 mb-4">{step.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {step.tips.map((tip, tipIndex) => (
                      <span key={tipIndex} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                        💡 {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategies Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Winning Strategies</h2>
          <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
            Every player has their style. Find yours and maximize your chances!
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-transform"
              >
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FFE500]" />
                  {strategy.name}
                </h3>
                <p className="text-gray-300 mb-4">{strategy.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">✅ {strategy.winRate}</span>
                  <span className="text-orange-400">⚠️ {strategy.risk}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Players Love SuiJackpot</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card p-6 text-center"
            >
              <Shield className="w-12 h-12 mx-auto mb-4 text-[#00D4FF]" />
              <h3 className="text-xl font-bold mb-2">100% Transparent</h3>
              <p className="text-gray-300">Every draw uses Sui's blockchain randomness. No manipulation possible.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 text-center"
            >
              <Gift className="w-12 h-12 mx-auto mb-4 text-[#FFE500]" />
              <h3 className="text-xl font-bold mb-2">90% Prize Pool</h3>
              <p className="text-gray-300">Industry-leading returns. We only take 5% for platform operations.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 text-center"
            >
              <Zap className="w-12 h-12 mx-auto mb-4 text-[#FF61E6]" />
              <h3 className="text-xl font-bold mb-2">Instant Payouts</h3>
              <p className="text-gray-300">Winners receive their prize immediately. No waiting, no paperwork.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/20 to-[#FFE500]/20 animate-pulse" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Win Big?</h2>
              <p className="text-xl text-gray-300 mb-8">
                The next round starts soon. Don't miss your chance at the jackpot!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/example" 
                  className="px-8 py-4 bg-white/10 border border-white/20 rounded-lg font-bold hover:bg-white/20 transition-colors"
                >
                  Try Demo First
                </Link>
                <Link 
                  href="/" 
                  className="px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-bold hover:scale-105 transition-transform"
                >
                  Play Real Game
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}