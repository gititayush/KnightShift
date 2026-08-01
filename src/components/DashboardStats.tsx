import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Database, RefreshCw, Zap, Sliders, ShieldCheck, Flame } from 'lucide-react';

export const DashboardStats: React.FC = () => {
  const [depth, setDepth] = useState<number>(8);
  const [nodes, setNodes] = useState<number>(425890);
  const [nps, setNps] = useState<number>(650000);
  const [hashMb, setHashMb] = useState<number>(64);
  const [ttHitRate, setTtHitRate] = useState<number>(58.4);
  const [betaCutoffs, setBetaCutoffs] = useState<number>(76.2);
  const [pvsResearches, setPvsResearches] = useState<number>(4.2);
  const [lmrReductions, setLmrReductions] = useState<number>(28.6);
  const [historyUpdates, setHistoryUpdates] = useState<number>(24500);
  const [killerUpdates, setKillerUpdates] = useState<number>(9820);
  const [evaluation, setEvaluation] = useState<number>(+0.35);

  return (
    <section id="dashboard" className="py-24 relative bg-[#08080a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3">
            <Activity className="w-3.5 h-3.5" />
            REAL-TIME TELEMETRY HUD
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Engine Statistics <span className="text-gradient-blue">Dashboard</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Structured metrics telemetry ready to connect via C++ UCI WebSocket or IPC shared memory protocol.
          </p>
        </div>

        {/* Dashboard Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Card 1: Current Depth */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">CURRENT DEPTH</span>
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mb-1">
              Depth {depth}
            </div>
            <div className="text-[11px] font-mono text-blue-300">
              Selective Depth: {depth + 4} plies
            </div>
          </div>

          {/* Card 2: Total Nodes */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">NODES SEARCHED</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-cyan-400 mb-1">
              {nodes.toLocaleString()}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Subtree visits
            </div>
          </div>

          {/* Card 3: Nodes Per Second */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">NODES PER SECOND</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-400 mb-1">
              {(nps / 1000).toFixed(0)} K/s
            </div>
            <div className="text-[11px] font-mono text-emerald-400">
              Single Thread Peak
            </div>
          </div>

          {/* Card 4: Evaluation */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">EVALUATION SCORE</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mb-1">
              {evaluation > 0 ? `+${evaluation.toFixed(2)}` : evaluation.toFixed(2)}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Centipawns (+/-)
            </div>
          </div>

        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300">HASH USAGE</span>
              <span className="text-xs font-mono font-bold text-blue-400">{hashMb} MB (42%)</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }} />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Zobrist Transposition Table allocations
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300">TT HIT RATE</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{ttHitRate}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${ttHitRate}%` }} />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Exact & Bound hash hits
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300">BETA CUTOFFS</span>
              <span className="text-xs font-mono font-bold text-cyan-400">{betaCutoffs}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${betaCutoffs}%` }} />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Moves causing early beta cutoff
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300">PVS RE-SEARCHES</span>
              <span className="text-xs font-mono font-bold text-indigo-400">{pvsResearches}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pvsResearches * 5}%` }} />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Zero-window refutations
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300">LMR REDUCTIONS</span>
              <span className="text-xs font-mono font-bold text-amber-400">{lmrReductions}%</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${lmrReductions}%` }} />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Late quiet move reductions
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-300">HISTORY & KILLERS</span>
              <span className="text-xs font-mono font-bold text-teal-400">{(historyUpdates / 1000).toFixed(0)}k Updates</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-teal-400 rounded-full" style={{ width: '68%' }} />
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Quiet move heuristics table
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
