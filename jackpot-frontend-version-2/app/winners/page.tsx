"use client";

import { motion } from "framer-motion";
import { Trophy, Heart, TrendingUp, Clock, Sparkles, ChevronRight, Users, DollarSign } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SuiJackpotLogo } from "../../components/sui-jackpot-logo";

interface Winner {
  id: number;
  name: string;
  amount: string;
  date: string;
  tickets: number;
  totalTickets: number;
  winRate: string;
  story?: string;
  rounds: number;
  avatar: string;
  quote?: string;
}

export default function WinnersPage() {
  const [selectedWinner, setSelectedWinner] = useState<Winner | null>(null);

  const winners: Winner[] = [
    {
      id: 1,
      name: "Sarah Chen",
      amount: "$125,000",
      date: "2 hours ago",
      tickets: 15,
      totalTickets: 25000,
      winRate: "0.06%",
      rounds: 127,
      avatar: "SC",
      story: "Sarah played for 4 months, buying just 10-20 tickets each round. She never gave up, even when friends told her the odds were too low. Today, her persistence paid off.",
      quote: "I knew my time would come. Every ticket was a vote of confidence in my future."
    },
    {
      id: 2,
      name: "Marcus Johnson",
      amount: "$87,500",
      date: "8 hours ago",
      tickets: 5,
      totalTickets: 18000,
      winRate: "0.03%",
      rounds: 89,
      avatar: "MJ",
      story: "Marcus, a teacher, could only afford 5 tickets per round. He played every week for 3 months. His students now call him 'Lucky Mr. J'.",
      quote: "Sometimes it's not about the odds — it's about the courage to keep going."
    },
    {
      id: 3,
      name: "Emma Davis",
      amount: "$250,000",
      date: "1 day ago",
      tickets: 50,
      totalTickets: 45000,
      winRate: "0.11%",
      rounds: 203,
      avatar: "ED",
      story: "Emma lost her job 6 months ago. She played small amounts while job hunting. This win came just when she needed it most.",
      quote: "The darkest nights produce the brightest stars. Never stop believing."
    },
    {
      id: 4,
      name: "David Park",
      amount: "$175,000",
      date: "2 days ago",
      tickets: 8,
      totalTickets: 30000,
      winRate: "0.03%",
      rounds: 156,
      avatar: "DP",
      story: "David bought exactly 8 tickets every round - his lucky number. After 156 rounds, luck finally smiled on him.",
      quote: "Consistency and faith. That's all you need."
    },
    {
      id: 5,
      name: "Lisa Wong",
      amount: "$320,000",
      date: "3 days ago",
      tickets: 25,
      totalTickets: 52000,
      winRate: "0.05%",
      rounds: 245,
      avatar: "LW",
      story: "Lisa played for her sick mother's treatment. She never missed a round, always buying during the 2X multiplier. Her dedication inspired an entire community.",
      quote: "When you play for something bigger than yourself, the universe listens."
    },
    {
      id: 6,
      name: "James Miller",
      amount: "$95,000",
      date: "5 days ago",
      tickets: 3,
      totalTickets: 20000,
      winRate: "0.015%",
      rounds: 178,
      avatar: "JM",
      story: "James bought just 3 tickets every Friday - his family tradition. The smallest player with the biggest heart finally won.",
      quote: "Size doesn't matter. Heart does."
    }
  ];

  const stats = {
    totalWinners: "10,847",
    totalPrizesPaid: "$125.8M",
    averageWinRate: "0.08%",
    biggestWin: "$500,000",
    smallestWinningTickets: "1 ticket",
    mostPersistentWinner: "312 rounds"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#0F1635] to-[#1A1F3A] text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <SuiJackpotLogo />
          <nav className="flex items-center gap-6">
            <Link href="/tutorial" className="hover:text-[#00D4FF] transition-colors">How to Play</Link>
            <Link href="/example" className="hover:text-[#00D4FF] transition-colors">Demo</Link>
            <Link href="/" className="px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Play Now
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Every Winner Has a Story
          </h1>
          <p className="text-xl text-gray-300 mb-8 italic">
            "Sometimes, it's not about the odds — it's about the courage to keep going, 
            the strength to stay true to one's path, and the belief that every struggle 
            carries meaning beyond the outcome."
          </p>
          <div className="flex items-center justify-center gap-2 text-[#FFE500]">
            <Heart className="w-5 h-5 fill-current" />
            <span className="font-semibold">10,847 Dreams Realized</span>
            <Heart className="w-5 h-5 fill-current" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stats).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 text-center"
              >
                <p className="text-2xl font-bold gradient-text">{value}</p>
                <p className="text-sm text-gray-400 capitalize mt-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Winners Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Recent Winners</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner, index) => (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 hover:scale-105 transition-all cursor-pointer"
                onClick={() => setSelectedWinner(winner)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#FFE500] flex items-center justify-center font-bold">
                    {winner.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{winner.name}</h3>
                    <p className="text-sm text-gray-400">{winner.date}</p>
                  </div>
                  <p className="text-2xl font-bold text-[#FFE500]">{winner.amount}</p>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Winning Tickets</span>
                    <span className="font-semibold">{winner.tickets}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="font-semibold text-[#00D4FF]">{winner.winRate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rounds Played</span>
                    <span className="font-semibold">{winner.rounds}</span>
                  </div>
                </div>

                {winner.quote && (
                  <p className="text-sm italic text-gray-300 border-l-2 border-[#FFE500] pl-3">
                    "{winner.quote}"
                  </p>
                )}

                <button className="mt-4 text-sm text-[#00D4FF] flex items-center gap-1 hover:gap-2 transition-all">
                  Read Full Story <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspiration Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-[#FFE500]" />
            <h2 className="text-3xl font-bold mb-6">The Power of Persistence</h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Every winner you see here started with a dream and a single ticket. They faced the same odds, 
              the same doubts, the same voices saying "it's impossible." But they kept playing, not because 
              the odds were in their favor, but because they believed in the possibility of change.
            </p>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Some played for months, others for days. Some bought hundreds of tickets, others just one. 
              But they all shared one thing in common: they never gave up. They understood that sometimes 
              life's biggest rewards come to those who dare to keep trying when others quit.
            </p>
            <div className="glass-card p-8 max-w-2xl mx-auto">
              <p className="text-xl font-semibold mb-4">Your Story Could Be Next</p>
              <p className="text-gray-300 mb-6">
                Join thousands of players who choose hope over doubt, action over inaction, 
                and possibility over impossibility.
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] rounded-lg font-bold hover:scale-105 transition-transform"
              >
                Start Your Journey
                <Trophy className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Winner Modal */}
      {selectedWinner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedWinner(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass-card p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#FFE500] flex items-center justify-center font-bold text-2xl">
                {selectedWinner.avatar}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{selectedWinner.name}</h3>
                <p className="text-[#FFE500] text-xl">{selectedWinner.amount} Winner</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-gray-400">Tickets</p>
                <p className="text-xl font-bold">{selectedWinner.tickets}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-xl font-bold text-[#00D4FF]">{selectedWinner.winRate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Rounds</p>
                <p className="text-xl font-bold">{selectedWinner.rounds}</p>
              </div>
            </div>

            {selectedWinner.story && (
              <div className="mb-6">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Their Story
                </h4>
                <p className="text-gray-300 leading-relaxed">{selectedWinner.story}</p>
              </div>
            )}

            {selectedWinner.quote && (
              <blockquote className="border-l-4 border-[#FFE500] pl-4 italic text-gray-300">
                "{selectedWinner.quote}"
              </blockquote>
            )}

            <button
              onClick={() => setSelectedWinner(null)}
              className="mt-6 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}