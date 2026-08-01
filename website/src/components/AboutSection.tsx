import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Shield, Code, Heart, Github, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-24 relative bg-[#090a0e] overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-4">
          <Terminal className="w-3.5 h-3.5" />
          BEHIND THE CODE
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
          Built From Scratch in <span className="text-gradient-blue">C++20</span>
        </h2>

        <div className="glass-panel-glow p-8 sm:p-12 rounded-3xl border border-blue-500/30 text-left space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base mb-12">
          
          <p className="text-lg font-medium text-white">
            <span className="text-blue-400 font-extrabold">KnightShift</span> is a personal software project created completely from scratch in C++ to deeply understand chess programming, low-level bitwise algorithms, and high-throughput search techniques—rather than wrapping existing engines or libraries.
          </p>

          <p>
            Building a modern chess engine requires mastering complex data structures (Bitboards, Magic attack tables), memory layout optimization, Zobrist hashing, and multi-ply Alpha-Beta search heuristics like PVS, Late Move Reductions, and Quiescence search. Every line of code in KnightShift reflects a commitment to technical precision and computer science fundamentals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Code className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400">LANGUAGE</div>
                <div className="text-sm font-bold text-white font-mono">Modern C++20</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400">DESIGN</div>
                <div className="text-sm font-bold text-white font-mono">Zero Dependencies</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Award className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs font-mono text-slate-400">STANDARDS</div>
                <div className="text-sm font-bold text-white font-mono">UCI Compliant</div>
              </div>
            </div>
          </div>

        </div>

        <a
          href="https://github.com/gititayush/KnightShift.git"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-glow-blue transition-all hover:scale-105"
        >
          <Github className="w-5 h-5" />
          Explore Source Code on GitHub
        </a>

      </div>
    </section>
  );
};
