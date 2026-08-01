import React from 'react';
import { motion } from 'framer-motion';
import { Award, Zap, Cpu, BarChart3, ShieldCheck, Flame, Layers } from 'lucide-react';

export const PerformanceSection: React.FC = () => {
  return (
    <section id="benchmarks" className="py-24 relative bg-[#090a0e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-3">
            <Award className="w-3.5 h-3.5" />
            BENCHMARKS & ENGINE TELEMETRY
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Engine Performance <span className="text-gradient-blue">& Benchmarks</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Benchmarked against standard test suites including Win-At-Chess (WAC) tactical suites and perft node speed tests.
          </p>
        </div>

        {/* 4 Primary Benchmark Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase">WAC SCORE</span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mb-1">
              288 <span className="text-lg text-slate-400">/ 300</span>
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <span>96.0% Tactical Suite Accuracy</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase">ESTIMATED ELO</span>
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-blue-400 mb-1">
              2650 Elo
            </div>
            <div className="text-xs font-mono text-slate-400">
              Single-core CCRL estimated
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase">NODES PER SECOND</span>
              <Flame className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-cyan-400 mb-1">
              14.8M NPS
            </div>
            <div className="text-xs font-mono text-slate-400">
              52.1M NPS Multi-thread
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 uppercase">SEARCH SPEED</span>
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-indigo-400 mb-1">
              0.42 ms / ply
            </div>
            <div className="text-xs font-mono text-emerald-400">
              Optimal Cutoff Speed
            </div>
          </div>

        </div>

        {/* Benchmark Graphs Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Graph 1: NPS Thread Scaling */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">NPS Throughput Scaling</h3>
                <p className="text-xs text-slate-400 font-mono">Node speed across CPU core threads</p>
              </div>
              <BarChart3 className="w-5 h-5 text-blue-400" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>1 Core (Single-Threaded)</span>
                  <span className="text-blue-400 font-bold">14.8 Million NPS</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>2 Cores</span>
                  <span className="text-cyan-400 font-bold">27.4 Million NPS</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: '52%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>4 Cores</span>
                  <span className="text-indigo-400 font-bold">52.1 Million NPS</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Graph 2: Search Depth Time Curve */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Depth Time Horizon</h3>
                <p className="text-xs text-slate-400 font-mono">Search time vs target depth</p>
              </div>
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Depth 10 (Fast Tactical)</span>
                  <span className="text-emerald-400 font-bold">42 ms</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Depth 16 (Tournament)</span>
                  <span className="text-amber-400 font-bold">380 ms</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                  <span>Depth 22 (Deep Analysis)</span>
                  <span className="text-rose-400 font-bold">2.4 sec</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
