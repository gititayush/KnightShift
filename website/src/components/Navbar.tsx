import React, { useState, useEffect } from 'react';
import { Github, Cpu, Activity, GitBranch, Terminal, Award, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#08080a]/90 dark:bg-[#08080a]/90 light:bg-white/95 backdrop-blur-md border-b border-slate-800/80 light:border-slate-300 py-3 shadow-glass'
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo with Premium Chess Knight */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-glow-blue transition-transform group-hover:scale-105">
              <span className="text-2xl select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                ♞
              </span>
              <div className="absolute inset-0 rounded-xl bg-blue-400/20 blur-sm group-hover:blur-md transition-all" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white dark:text-white light:text-slate-900 flex items-center gap-1.5 font-sans">
                KnightShift
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-600 font-mono tracking-wider">CHESS ENGINE</span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">
            <a href="#live-engine" className="px-3 py-1.5 rounded-lg hover:text-blue-500 hover:bg-slate-800/50 light:hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-400" />
              Live Engine
            </a>
            <a href="#features" className="px-3 py-1.5 rounded-lg hover:text-blue-500 hover:bg-slate-800/50 light:hover:bg-slate-200 transition-colors">
              Features
            </a>
            <a href="#search-visualization" className="px-3 py-1.5 rounded-lg hover:text-blue-500 hover:bg-slate-800/50 light:hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              Search Tree
            </a>
            <a href="#dashboard" className="px-3 py-1.5 rounded-lg hover:text-blue-500 hover:bg-slate-800/50 light:hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              Stats
            </a>
            <a href="#architecture" className="px-3 py-1.5 rounded-lg hover:text-blue-500 hover:bg-slate-800/50 light:hover:bg-slate-200 transition-colors">
              Architecture
            </a>
            <a href="#benchmarks" className="px-3 py-1.5 rounded-lg hover:text-blue-500 hover:bg-slate-800/50 light:hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Benchmarks
            </a>
            <a href="#about" className="px-3 py-1.5 rounded-lg hover:text-blue-500 hover:bg-slate-800/50 light:hover:bg-slate-200 transition-colors">
              About
            </a>
          </nav>

          {/* Actions: Light/Dark Mode Toggle & GitHub */}
          <div className="flex items-center gap-3">
            
            {/* Global Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-200 hover:bg-slate-700/80 border border-slate-700/60 light:border-slate-300 text-amber-400 hover:text-amber-300 transition-all shadow-sm flex items-center gap-1.5"
              title="Toggle Light / Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="text-xs font-mono text-slate-300 dark:text-slate-300 light:text-slate-800 font-bold hidden sm:inline">
                {isDarkMode ? 'Light' : 'Dark'} Mode
              </span>
            </button>

            <a 
              href="https://github.com/gititayush/KnightShift.git" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-900 border border-slate-700/60 text-slate-200 dark:text-slate-200 light:text-white hover:text-white transition-all shadow-sm group"
            >
              <Github className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">GitHub Repository</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
