import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Binary, ShieldCheck, Database, Cpu, Terminal, ArrowRight, Code } from 'lucide-react';
import { ArchitectureNode } from '../types/chess';

const MODULES: ArchitectureNode[] = [
  {
    id: 'board-repr',
    title: 'Board Representation',
    subtitle: 'Bitboard Mask System',
    description: 'Uses 64-bit uint64_t bitboards representing piece layouts and occupancy masks for hyper-fast bitwise manipulation.',
    details: [
      'Separate bitboards for each piece type and color (12 bitboards total).',
      'Combined occupancy bitboards (White, Black, All).',
      'Fast POPCNT and trailing zero count (ctzll) for bit scanning.'
    ],
    cppFile: 'board.hpp / bitboard.cpp'
  },
  {
    id: 'move-gen',
    title: 'Move Generation',
    subtitle: 'Magic Bitboards & Attack Masks',
    description: 'Generates pseudo-legal moves using precomputed attack masks for pawns, knights, kings, and Magic Bitboards for sliders.',
    details: [
      'Instantaneous O(1) Magic Bitboard lookup for Rooks & Bishops.',
      'Check filtering to yield strictly legal moves.',
      'Specialized move generators for Captures and Quiet moves.'
    ],
    cppFile: 'movegen.cpp / magic.hpp'
  },
  {
    id: 'search-engine',
    title: 'Search Engine',
    subtitle: 'Iterative PVS Alpha-Beta',
    description: 'High-performance Principal Variation Search (PVS) with adaptive pruning heuristics and dynamic time allocation.',
    details: [
      'Iterative deepening loop with aspiration windows.',
      'Null Move Pruning (NMP), LMR, RFP, and LMP heuristics.',
      'Quiescence search to eliminate horizon tactics.'
    ],
    cppFile: 'search.cpp / pvs.cpp'
  },
  {
    id: 'static-eval',
    title: 'Static Evaluation',
    subtitle: 'Tapered Positional Scoring',
    description: 'Calculates positional and material balance using Piece-Square Tables (PeST), pawn structure, mobility, and king safety.',
    details: [
      'Tapered evaluation interpolating between Middlegame and Endgame phase.',
      'Static Exchange Evaluation (SEE) for capture sequence sanity.',
      'Passed pawn advancement and king shelter safety shields.'
    ],
    cppFile: 'evaluate.cpp / pest.hpp'
  },
  {
    id: 'transposition-table',
    title: 'Transposition Table',
    subtitle: 'Zobrist 64-bit Hash Cache',
    description: 'Cache mechanism storing evaluated search nodes to prune transpositions and provide instant move ordering hints.',
    details: [
      '64-bit Zobrist key hashing for board state, castling rights, and en-passant.',
      'Depth-preferred replacement strategy with aging.',
      'Stores Exact, Upper Bound (Beta), and Lower Bound (Alpha) scores.'
    ],
    cppFile: 'transposition.cpp / zobrist.hpp'
  },
  {
    id: 'uci-protocol',
    title: 'UCI Protocol',
    subtitle: 'Universal Chess Interface',
    description: 'Standard UCI protocol implementation enabling seamless integration with Chess GUIs (CuteChess, Arena, Lichess).',
    details: [
      'Parses "uci", "isready", "position fen", "go depth wtime btime".',
      'Asynchronous search thread cancellation and output streaming.',
      'Standardized info line formatting (depth, seldepth, score cp, nps, pv).'
    ],
    cppFile: 'uci.cpp / main.cpp'
  }
];

export const ArchitectureSection: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<ArchitectureNode>(MODULES[0]);

  return (
    <section id="architecture" className="py-24 relative bg-[#090a0e] overflow-hidden">
      
      {/* Background Accent */}
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-3">
            <Layers className="w-3.5 h-3.5" />
            C++ SYSTEM ARCHITECTURE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Engine Pipeline <span className="text-gradient-blue">& Subsystems</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Modular C++ architecture designed for cache locality, minimal memory allocation during search, and high thread throughput.
          </p>
        </div>

        {/* Pipeline Diagram (Interactive Connected Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Module Nodes Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MODULES.map((mod, idx) => {
              const isSelected = selectedModule.id === mod.id;
              return (
                <motion.div
                  key={mod.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedModule(mod)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative ${
                    isSelected 
                      ? 'glass-panel-glow border-blue-500/80 shadow-glow-blue bg-blue-950/20' 
                      : 'glass-panel border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-blue-400 border border-slate-800 font-bold">
                      Module 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{mod.cppFile}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {mod.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Detailed Inspector Panel */}
          <div className="lg:col-span-5 glass-panel-glow p-7 rounded-3xl border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-wider font-semibold">
                MODULE INSPECTOR
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                {selectedModule.cppFile}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">
              {selectedModule.title}
            </h3>
            <p className="text-xs text-blue-300 font-mono mb-4">
              {selectedModule.subtitle}
            </p>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {selectedModule.description}
            </p>

            <div className="space-y-2 mb-6">
              <div className="text-xs font-mono text-slate-400 mb-2">TECHNICAL HIGHLIGHTS</div>
              {selectedModule.details.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                  <span className="text-blue-400 font-mono mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-slate-300">Target Standard</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">C++20 Compiled</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
