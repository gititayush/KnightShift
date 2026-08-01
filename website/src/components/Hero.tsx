import React from 'react';
import { motion } from 'framer-motion';
import { Play, Github, BarChart3, Terminal, Zap, Shield, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-16 overflow-hidden bg-radial-gradient">
      
      {/* Background Animated Floating Chess Pieces */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-40 animate-grid-flow" />
        
        {/* Floating Knight 1 */}
        <motion.div 
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: [-20, 20, -20], rotate: [0, 8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-[10%] text-blue-500/30 text-8xl font-mono select-none"
        >
          ♘
        </motion.div>

        {/* Floating Queen */}
        <motion.div 
          initial={{ y: 0, rotate: 0 }}
          animate={{ y: [15, -25, 15], rotate: [0, -10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 right-[12%] text-indigo-500/30 text-9xl font-mono select-none"
        >
          ♕
        </motion.div>

        {/* Floating Rook */}
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: [-15, 15, -15] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 left-[18%] text-cyan-500/25 text-7xl font-mono select-none"
        >
          ♖
        </motion.div>

        {/* Floating Pawn */}
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: [20, -20, 20] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/3 right-[22%] text-slate-400/20 text-6xl font-mono select-none"
        >
          ♙
        </motion.div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md mb-8"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-mono font-medium text-blue-300">
            Written 100% from Scratch in C++20
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
        >
          <span className="text-white">Knight</span>
          <span className="text-gradient-blue">Shift</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed mb-10"
        >
          A modern chess engine written completely from scratch in C++ using <span className="text-blue-400 font-medium">bitboards</span>, <span className="text-blue-400 font-medium">alpha-beta search</span>, <span className="text-blue-400 font-medium">transposition tables</span>, <span className="text-blue-400 font-medium">null move pruning</span>, <span className="text-blue-400 font-medium">late move reductions</span>, <span className="text-blue-400 font-medium">principal variation search</span>, <span className="text-blue-400 font-medium">history heuristics</span> and <span className="text-blue-400 font-medium">advanced move ordering</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#live-engine"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow-blue transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            Play Now
          </a>

          <a
            href="https://github.com/gititayush/KnightShift.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm transition-all hover:scale-105 shadow-md"
          >
            <Github className="w-4 h-4" />
            GitHub
          </a>

          <a
            href="#dashboard"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 text-slate-300 hover:text-white font-semibold text-sm transition-all"
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Engine Statistics
          </a>
        </motion.div>

        {/* Quick Spec Highlights */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 pt-8 border-t border-slate-800/60 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          <div className="p-4 rounded-xl glass-panel">
            <div className="text-xs text-slate-400 font-mono mb-1">CHESS SPEED</div>
            <div className="text-2xl font-bold font-mono text-blue-400">14.8M NPS</div>
          </div>
          <div className="p-4 rounded-xl glass-panel">
            <div className="text-xs text-slate-400 font-mono mb-1">ESTIMATED ELO</div>
            <div className="text-2xl font-bold font-mono text-cyan-400">2650 Elo</div>
          </div>
          <div className="p-4 rounded-xl glass-panel">
            <div className="text-xs text-slate-400 font-mono mb-1">BOARD REPR.</div>
            <div className="text-2xl font-bold font-mono text-indigo-400">Bitboards</div>
          </div>
          <div className="p-4 rounded-xl glass-panel">
            <div className="text-xs text-slate-400 font-mono mb-1">PROTOCOL</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">UCI Standard</div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
