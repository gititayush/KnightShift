import React from 'react';
import { Shield, Github, Linkedin, Mail, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#060608] border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800/60">
          
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-blue">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                KnightShift
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed font-sans">
              KnightShift is an ultra-fast, modern chess engine written completely from scratch in C++ using Bitboards, Alpha-Beta Minimax search, Transposition Tables, and advanced move ordering heuristics.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Quick Links
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#live-engine" className="hover:text-blue-400 transition-colors">Play Live Engine</a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">Engine Features</a>
              </li>
              <li>
                <a href="#search-visualization" className="hover:text-blue-400 transition-colors">Search Visualizer</a>
              </li>
              <li>
                <a href="#dashboard" className="hover:text-blue-400 transition-colors">Statistics Dashboard</a>
              </li>
              <li>
                <a href="#benchmarks" className="hover:text-blue-400 transition-colors">Benchmarks</a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Connect & Repository
            </div>
            <div className="flex flex-col gap-2.5">
              <a
                href="https://github.com/gititayush/KnightShift.git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-blue-400 transition-colors"
              >
                <Github className="w-4 h-4 text-blue-400" />
                <span>GitHub Repository</span>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-blue-400 transition-colors"
              >
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn Profile</span>
              </a>

              <a
                href="mailto:contact@knightshift.engine"
                className="inline-flex items-center gap-2 text-xs font-mono text-slate-300 hover:text-blue-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-400" />
                <span>Email Contact</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            © {new Date().getFullYear()} KnightShift Chess Engine. Built with C++20, React & Tailwind.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
