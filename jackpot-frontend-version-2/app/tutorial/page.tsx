"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Trophy, TrendingUp, Gift, Shield, Sparkles, Play, Crown, Star, Coins, Timer } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SuiJackpotLogo } from "@/components/sui-jackpot-logo";

export default function TutorialPage() {
  const [highlightedSection, setHighlightedSection] = useState(0);

  // Auto-cycle through highlights every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedSection((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <SuiJackpotLogo />
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
      <section className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="text-6xl md:text-7xl font-black mb-6 gradient-text"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            Turn 1 SUI into 1000s
          </motion.h1>
          <motion.p 
            className="text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Every 10 minutes, one player takes home <span className="text-[#FFE500] font-bold">90% of the entire pool</span>. 
            Your ticket could be the winner.
          </motion.p>

          {/* Live Demo Stats */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="glass-card text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-[#00D4FF] mb-2">$2.3M</div>
              <div className="text-gray-300">Won Last Week</div>
            </div>
            <div className="glass-card text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-[#FFE500] mb-2">1,247</div>
              <div className="text-gray-300">Winners Today</div>
            </div>
            <div className="glass-card text-center hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-[#A855F7] mb-2">847K</div>
              <div className="text-gray-300">Lucky Sunday Pool</div>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
            >
              <Play className="w-5 h-5" />
              Start Playing Now
            </Link>
            <Link 
              href="/example" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/20 rounded-lg font-bold text-lg hover:bg-white/20 transition-colors"
            >
              Try Demo First
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Prize Distribution Showcase */}
      <section className="py-20 px-4 bg-white/5 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            The Most Generous Jackpot on Sui
          </motion.h2>
          <motion.p 
            className="text-center text-gray-300 mb-16 text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Unlike other platforms that keep 30-50%, we take 0% fees. Here&apos;s where every SUI goes:
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Winner - 90% */}
            <motion.div
              className={`glass-card p-8 text-center relative overflow-hidden ${
                highlightedSection === 0 ? 'ring-4 ring-[#FFE500] bg-[#FFE500]/10' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              animate={highlightedSection === 0 ? { scale: [1, 1.05, 1] } : {}}
            >
              {highlightedSection === 0 && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFE500]/20 to-[#FFA500]/20 animate-pulse" />
              )}
              <div className="relative z-10">
                <Crown className="w-16 h-16 mx-auto mb-4 text-[#FFE500]" />
                <div className="text-6xl font-black text-[#FFE500] mb-2">90%</div>
                <h3 className="text-2xl font-bold mb-4">Winner Takes All</h3>
                <p className="text-gray-300 mb-6">
                  One lucky player wins 90% of the entire pool. Last winner took home <span className="font-bold text-[#FFE500]">47,832 SUI</span>!
                </p>
                <div className="bg-[#FFE500]/20 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-2">Example Pool: 1,000 SUI</div>
                  <div className="text-2xl font-bold text-[#FFE500]">Winner Gets: 900 SUI</div>
                </div>
              </div>
            </motion.div>

            {/* Airdrop - 5% */}
            <motion.div
              className={`glass-card p-8 text-center relative overflow-hidden ${
                highlightedSection === 1 ? 'ring-4 ring-[#00D4FF] bg-[#00D4FF]/10' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              animate={highlightedSection === 1 ? { scale: [1, 1.05, 1] } : {}}
            >
              {highlightedSection === 1 && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/20 to-[#0088CC]/20 animate-pulse" />
              )}
              <div className="relative z-10">
                <Gift className="w-16 h-16 mx-auto mb-4 text-[#00D4FF]" />
                <div className="text-6xl font-black text-[#00D4FF] mb-2">5%</div>
                <h3 className="text-2xl font-bold mb-4">Community Airdrop</h3>
                <p className="text-gray-300 mb-6">
                  5% goes to <span className="font-bold text-[#00D4FF]">ALL participants</span> in the round. Everyone gets something back!
                </p>
                <div className="bg-[#00D4FF]/20 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-2">Example Pool: 1,000 SUI</div>
                  <div className="text-2xl font-bold text-[#00D4FF]">Airdrop: 50 SUI</div>
                  <div className="text-sm text-gray-300">Split among all players</div>
                </div>
              </div>
            </motion.div>

            {/* Next Round - 4% */}
            <motion.div
              className={`glass-card p-8 text-center relative overflow-hidden ${
                highlightedSection === 2 ? 'ring-4 ring-[#FF61E6] bg-[#FF61E6]/10' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              animate={highlightedSection === 2 ? { scale: [1, 1.05, 1] } : {}}
            >
              {highlightedSection === 2 && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF61E6]/20 to-[#A855F7]/20 animate-pulse" />
              )}
              <div className="relative z-10">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#FF61E6]" />
                <div className="text-6xl font-black text-[#FF61E6] mb-2">4%</div>
                <h3 className="text-2xl font-bold mb-4">Next Round Boost</h3>
                <p className="text-gray-300 mb-6">
                  4% seeds the next round, ensuring there&apos;s always a <span className="font-bold text-[#FF61E6]">starting prize</span> waiting!
                </p>
                <div className="bg-[#FF61E6]/20 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-2">Example Pool: 1,000 SUI</div>
                  <div className="text-2xl font-bold text-[#FF61E6]">Boost: 40 SUI</div>
                  <div className="text-sm text-gray-300">Added to next round</div>
                </div>
              </div>
            </motion.div>

            {/* Lucky Sunday - 1% */}
            <motion.div
              className={`glass-card p-8 text-center relative overflow-hidden ${
                highlightedSection === 3 ? 'ring-4 ring-[#A855F7] bg-[#A855F7]/10' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              animate={highlightedSection === 3 ? { scale: [1, 1.05, 1] } : {}}
            >
              {highlightedSection === 3 && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#A855F7]/20 to-[#7C3AED]/20 animate-pulse" />
              )}
              <div className="relative z-10">
                <Star className="w-16 h-16 mx-auto mb-4 text-[#A855F7]" />
                <div className="text-6xl font-black text-[#A855F7] mb-2">1%</div>
                <h3 className="text-2xl font-bold mb-4">Lucky Sunday</h3>
                <p className="text-gray-300 mb-6">
                  1% goes to our weekly <span className="font-bold text-[#A855F7]">Lucky Sunday</span> mega prize! All weekly players are eligible.
                </p>
                <div className="bg-[#A855F7]/20 rounded-lg p-4">
                  <div className="text-sm text-gray-300 mb-2">Example Pool: 1,000 SUI</div>
                  <div className="text-2xl font-bold text-[#A855F7]">Lucky Fund: 10 SUI</div>
                  <div className="text-sm text-gray-300">Added to Sunday prize</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Game Flow Visualization */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#0F1635] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-5xl font-black text-center mb-4 gradient-text"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Your Path to Massive Wins
          </motion.h2>
          <motion.p 
            className="text-center text-gray-300 mb-16 text-xl max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            See exactly how you can turn small investments into life-changing prizes
          </motion.p>

          {/* Horizontal Flow with Clear Steps */}
          <div className="relative max-w-6xl mx-auto">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#00D4FF]/20 via-[#FFE500]/20 via-[#FF61E6]/20 to-[#A855F7]/20 hidden lg:block transform -translate-y-1/2" />
            
            {/* Steps Container */}
            <div className="grid md:grid-cols-4 gap-6 lg:gap-4 relative">
              {/* Step 1: Buy Tickets */}
              <motion.div
                className="relative flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {/* Step Number Circle */}
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-[#00D4FF] to-[#0088CC] rounded-full flex items-center justify-center font-black text-2xl text-white shadow-xl mb-6 relative z-10"
                  whileInView={{ scale: [0, 1.1, 1] }}
                  viewport={{ once: true }}
                >
                  1
                </motion.div>
                
                {/* Content Card */}
                <div className="glass-card p-6 text-center w-full hover:transform hover:scale-105 transition-all duration-300">
                  <Coins className="w-12 h-12 mx-auto mb-4 text-[#00D4FF]" />
                  <h3 className="text-2xl font-bold mb-3">Buy Tickets</h3>
                  <p className="text-gray-300 mb-4">Start with just 0.1 SUI per ticket. Buy as many as you want!</p>
                  <div className="bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Example Investment</div>
                    <div className="text-xl font-bold text-[#00D4FF]">10 SUI = 100 tickets</div>
                  </div>
                </div>

                {/* Arrow to next step (desktop only) */}
                <motion.div 
                  className="absolute -right-8 top-10 hidden lg:block"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <ArrowRight className="w-8 h-8 text-[#00D4FF]" />
                </motion.div>
              </motion.div>

              {/* Step 2: Pool Grows */}
              <motion.div
                className="relative flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                {/* Step Number Circle */}
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-[#FFE500] to-[#FFA500] rounded-full flex items-center justify-center font-black text-2xl text-white shadow-xl mb-6 relative z-10"
                  whileInView={{ scale: [0, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  2
                </motion.div>
                
                {/* Content Card */}
                <div className="glass-card p-6 text-center w-full hover:transform hover:scale-105 transition-all duration-300">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[#FFE500]" />
                  <h3 className="text-2xl font-bold mb-3">Pool Grows</h3>
                  <p className="text-gray-300 mb-4">Watch excitement build for 10 minutes as prize grows!</p>
                  <div className="bg-[#FFE500]/10 border border-[#FFE500]/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Current Pool</div>
                    <div className="text-xl font-bold text-[#FFE500]">18,492 SUI</div>
                    <motion.div 
                      className="text-sm text-[#FFE500]"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      & growing every second!
                    </motion.div>
                  </div>
                </div>

                {/* Arrow to next step (desktop only) */}
                <motion.div 
                  className="absolute -right-8 top-10 hidden lg:block"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <ArrowRight className="w-8 h-8 text-[#FFE500]" />
                </motion.div>
              </motion.div>

              {/* Step 3: Win Big */}
              <motion.div
                className="relative flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                {/* Step Number Circle with Glow */}
                <div className="relative mb-6">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-[#FF61E6] to-[#A855F7] rounded-full flex items-center justify-center font-black text-2xl text-white shadow-xl relative z-10"
                    whileInView={{ scale: [0, 1.1, 1] }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    3
                  </motion.div>
                  {/* Pulsing glow */}
                  <motion.div 
                    className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-[#FF61E6] to-[#A855F7] rounded-full blur-lg"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
                
                {/* Content Card - Highlighted */}
                <div className="glass-card p-6 text-center w-full hover:transform hover:scale-105 transition-all duration-300 border-2 border-[#FF61E6]/50 bg-gradient-to-br from-[#FF61E6]/10 to-[#A855F7]/10">
                  <Crown className="w-12 h-12 mx-auto mb-4 text-[#FF61E6]" />
                  <h3 className="text-2xl font-bold mb-3 text-[#FF61E6]">WIN 90%!</h3>
                  <p className="text-gray-300 mb-4">One lucky winner takes almost everything!</p>
                  <div className="bg-[#FF61E6]/10 border border-[#FF61E6]/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Your Potential Win</div>
                    <div className="text-xl font-bold text-[#FF61E6]">16,643 SUI</div>
                    <div className="text-lg text-[#FF61E6] font-bold">1,664x Return!</div>
                  </div>
                </div>

                {/* Arrow to next step (desktop only) */}
                <motion.div 
                  className="absolute -right-8 top-10 hidden lg:block"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <ArrowRight className="w-8 h-8 text-[#FF61E6]" />
                </motion.div>
              </motion.div>

              {/* Step 4: Lucky Sunday Bonus */}
              <motion.div
                className="relative flex flex-col items-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
              >
                {/* Step Number Circle */}
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-[#A855F7] to-[#7C3AED] rounded-full flex items-center justify-center font-black text-2xl text-white shadow-xl mb-6 relative z-10"
                  whileInView={{ scale: [0, 1.1, 1] }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Star className="w-8 h-8" />
                </motion.div>
                
                {/* Content Card - Special */}
                <div className="glass-card p-6 text-center w-full hover:transform hover:scale-105 transition-all duration-300 border-2 border-[#A855F7]/50">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#A855F7]" />
                  <h3 className="text-2xl font-bold mb-3 text-[#A855F7]">Lucky Sunday</h3>
                  <p className="text-gray-300 mb-4">Play any day & get entered for weekly mega prize!</p>
                  <div className="bg-[#A855F7]/10 border border-[#A855F7]/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">This Week&apos;s Prize</div>
                    <div className="text-xl font-bold text-[#A855F7]">847,392 SUI</div>
                    <div className="text-sm text-[#A855F7] font-semibold">FREE Entry!</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Mobile scroll indicator */}
            <div className="mt-8 text-center lg:hidden">
              <p className="text-gray-400 text-sm">Swipe to see all steps →</p>
            </div>
          </div>

          {/* Key Benefits Summary */}
          <motion.div 
            className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-bold text-lg mb-1">Quick Rounds</h4>
              <p className="text-gray-400 text-sm">New chance every 10 minutes</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-bold text-lg mb-1">90% to Winner</h4>
              <p className="text-gray-400 text-sm">Biggest prize share on Sui</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h4 className="font-bold text-lg mb-1">Everyone Wins</h4>
              <p className="text-gray-400 text-sm">5% airdrop to all players</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lucky Sunday Feature */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#A855F7]/10 to-[#7C3AED]/10 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black mb-6">
              <span className="text-5xl">🌟</span> Lucky Sunday <span className="text-5xl">🌟</span>
            </h2>
            <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Every Sunday, we draw for a <span className="font-bold text-[#A855F7]">massive weekly jackpot</span> using 
              all the 1% contributions from the week. All players who bought tickets during the week are automatically entered!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-3xl font-bold mb-6">How Lucky Sunday Works</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#A855F7] flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Play During the Week</h4>
                    <p className="text-gray-300">Buy tickets in any round from Monday to Sunday. You&apos;re automatically entered!</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#A855F7] flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Pool Accumulates</h4>
                    <p className="text-gray-300">1% from every round builds the massive Sunday prize pool throughout the week.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#A855F7] flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Sunday Drawing</h4>
                    <p className="text-gray-300">Every Sunday evening, one lucky weekly player wins the entire accumulated prize!</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="glass-card p-8 text-center bg-gradient-to-br from-[#A855F7]/20 to-[#7C3AED]/20 border-2 border-[#A855F7]/50"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 mx-auto mb-6"
              >
                <Star className="w-full h-full text-[#A855F7]" />
              </motion.div>
              
              <h3 className="text-3xl font-bold mb-4">This Week&apos;s Prize</h3>
              <motion.div 
                className="text-6xl font-black text-[#A855F7] mb-6"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                847,392 SUI
              </motion.div>
              
              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span className="text-gray-300">Players Entered:</span>
                  <span className="font-bold text-[#A855F7]">12,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Days Left:</span>
                  <span className="font-bold text-[#FFE500]">3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Your Entries:</span>
                  <span className="font-bold text-white">Get playing!</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#A855F7]/30 rounded-lg">
                <p className="text-sm text-gray-200">
                  💡 <strong>Pro Tip:</strong> The more rounds you play during the week, the more entries you get for Lucky Sunday!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            So Simple, Anyone Can Win
          </motion.h2>
          <motion.p 
            className="text-center text-gray-300 mb-16 text-xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            No complex strategies. No hidden fees. Just pure excitement.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Buy Tickets",
                description: "Start with just 0.1 SUI. Buy as many tickets as you want.",
                icon: <Coins className="w-12 h-12" />,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "2", 
                title: "Wait 10 Minutes",
                description: "Watch the pool grow. Get 2X tickets in the final minute!",
                icon: <Timer className="w-12 h-12" />,
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "3",
                title: "Win Big",
                description: "One winner takes 90%. Everyone else gets airdrop rewards.",
                icon: <Trophy className="w-12 h-12" />,
                color: "from-yellow-500 to-orange-500"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white`}>
                  {step.icon}
                </div>
                <div className="text-6xl font-black text-gray-600 mb-4">{step.step}</div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-300 text-lg">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - The Moment of Truth */}
      <section className="py-32 px-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/30 via-[#FFE500]/30 to-[#FF61E6]/30 animate-pulse" />
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/40 rounded-full"
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                scale: 0 
              }}
              animate={{ 
                scale: [0, 1, 0],
                y: [null, -100]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-12"
          >
            <h2 className="text-6xl md:text-7xl font-black mb-6 gradient-text">
              Your Fortune Awaits
            </h2>
            <p className="text-3xl text-gray-200 mb-8 leading-relaxed">
              Every second you wait, someone else could be buying the winning ticket.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Link 
              href="/" 
              className="group relative px-12 py-6 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-2xl font-black text-2xl hover:scale-110 transition-all duration-300 shadow-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFE500] to-[#FFA500] opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="relative z-10 flex items-center gap-3">
                <Crown className="w-8 h-8" />
                Join the Game NOW
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <ArrowRight className="w-8 h-8" />
                </motion.div>
              </div>
            </Link>
            
            <Link 
              href="/example" 
              className="px-12 py-6 bg-white/10 border-2 border-white/30 rounded-2xl font-bold text-xl hover:bg-white/20 transition-all duration-300"
            >
              Try Demo Version
            </Link>
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Shield className="w-6 h-6 text-green-500" />
                <span>100% Transparent</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Zap className="w-6 h-6 text-blue-500" />
                <span>Instant Payouts</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span>Proven Winners</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}