import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Sparkles, GitCommit, ChevronRight } from 'lucide-react';
import { TimelineMilestone } from '../types/chess';

const MILESTONES: TimelineMilestone[] = [
  {
    step: 1,
    title: 'Bitboard Foundation',
    status: 'Completed',
    date: 'Milestone 1',
    description: 'Designed 64-bit uint64_t representation for board state, piece sets, and occupancy masks.',
    highlights: ['Popcount and bit-scan intrinsics', 'Basic move encoding & FEN parser']
  },
  {
    step: 2,
    title: 'Move Generation & Magic Bitboards',
    status: 'Completed',
    date: 'Milestone 2',
    description: 'Implemented Magic Bitboards for instant sliding piece attack generation (Rook & Bishop).',
    highlights: ['Legal move generator with check filtering', 'Zero memory allocation during move generation']
  },
  {
    step: 3,
    title: 'Static Evaluation & PeST',
    status: 'Completed',
    date: 'Milestone 3',
    description: 'Built piece-square tables, pawn structure scoring, mobility, and Static Exchange Evaluation (SEE).',
    highlights: ['Tapered evaluation interpolating mid/endgame', 'Passed pawn & king safety evaluation']
  },
  {
    step: 4,
    title: 'Alpha-Beta & PVS Search',
    status: 'Completed',
    date: 'Milestone 4',
    description: 'Implemented Principal Variation Search (PVS) with Transposition Tables, LMR, NMP, and Quiescence.',
    highlights: ['Zobrist hashing transposition table', 'History & Killer move ordering heuristics']
  },
  {
    step: 5,
    title: 'UCI Protocol Integration',
    status: 'Completed',
    date: 'Milestone 5',
    description: 'Fully integrated UCI command interface to support Arena, Cutechess, and Lichess bot hosting.',
    highlights: ['UCI protocol command handler', 'Asynchronous search thread controller']
  },
  {
    step: 6,
    title: 'Performance & Speed Optimization',
    status: 'Completed',
    date: 'Milestone 6',
    description: 'Optimized loop invariants, cache layout, SIMD alignment, achieving 14.8M NPS single core throughput.',
    highlights: ['Cache-friendly TT struct memory packing', 'Inline assembly and compiler micro-optimizations']
  },
  {
    step: 7,
    title: 'Future NNUE Evaluation',
    status: 'In Progress',
    date: 'Milestone 7',
    description: 'Training lightweight quantized neural networks (NNUE) for supercharged positional accuracy.',
    highlights: ['Accumulator incremental update system', 'Texel tuning on high-depth master self-play games']
  }
];

export const TimelineSection: React.FC = () => {
  return (
    <section id="timeline" className="py-24 relative bg-[#08080a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-3">
            <GitCommit className="w-3.5 h-3.5" />
            ENGINE ROADMAP & HISTORY
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Development <span className="text-gradient-blue">Timeline</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From basic bitboard math to sophisticated Alpha-Beta search and upcoming NNUE neural evaluation.
          </p>
        </div>

        {/* Timeline List */}
        <div className="relative max-w-4xl mx-auto">
          
          {/* Vertical Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-slate-800 -translate-x-1/2 hidden sm:block" />

          <div className="space-y-12">
            {MILESTONES.map((m, idx) => {
              const isEven = idx % 2 === 0;
              const isCompleted = m.status === 'Completed';

              return (
                <motion.div
                  key={m.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className={`relative flex flex-col sm:flex-row items-center ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  
                  {/* Timeline Badge Center */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-900 border-2 border-blue-500 flex items-center justify-center z-10 shadow-glow-blue">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                    )}
                  </div>

                  {/* Content Card */}
                  <div className={`w-full sm:w-[45%] pl-12 sm:pl-0 ${
                    isEven ? 'sm:text-right sm:pr-10' : 'sm:pl-10'
                  }`}>
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all">
                      
                      <div className={`flex items-center gap-2 mb-2 ${
                        isEven ? 'sm:justify-end' : 'justify-start'
                      }`}>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {m.date}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                          isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {m.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-2">
                        {m.title}
                      </h3>

                      <p className="text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
                        {m.description}
                      </p>

                      <div className={`space-y-1 ${
                        isEven ? 'sm:items-end' : 'items-start'
                      }`}>
                        {m.highlights.map((h, i) => (
                          <div key={i} className={`flex items-center gap-1.5 text-xs font-mono text-slate-300 ${
                            isEven ? 'sm:justify-end' : 'justify-start'
                          }`}>
                            <ChevronRight className="w-3 h-3 text-blue-400" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
