import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, GitBranch, Scissors, Database, ArrowRight, Zap, Eye, CheckCircle2 } from 'lucide-react';

interface TreeStep {
  id: string;
  nodeName: string;
  depth: number;
  evalScore: string;
  status: 'searching' | 'pv' | 'cutoff' | 'tt-hit';
  moveOrderRank: string;
  explanation: string;
}

const TREE_STEPS: TreeStep[] = [
  {
    id: 'step-1',
    nodeName: 'Root (Depth 0)',
    depth: 0,
    evalScore: '+0.25',
    status: 'pv',
    moveOrderRank: 'Root',
    explanation: 'Evaluating initial position FEN. Iterative deepening begins at Depth 1.'
  },
  {
    id: 'step-2',
    nodeName: 'Move 1: e2e4 (TT Move)',
    depth: 1,
    evalScore: '+0.45',
    status: 'pv',
    moveOrderRank: 'TT Hash Move #1',
    explanation: 'Transposition Table best move evaluated first. Candidate Principal Variation (PV).'
  },
  {
    id: 'step-3',
    nodeName: 'Response: e7e5',
    depth: 2,
    evalScore: '+0.38',
    status: 'pv',
    moveOrderRank: 'MVV-LVA Capture #1',
    explanation: 'Black replies with central pawn push. Alpha updated to +0.38.'
  },
  {
    id: 'step-4',
    nodeName: 'Move 2: d2d4 (Beta Cutoff)',
    depth: 1,
    evalScore: '+1.80',
    status: 'cutoff',
    moveOrderRank: 'Killer Move #1',
    explanation: 'BETA CUTOFF PRUNING! Score exceeds beta threshold (+1.80 >= beta). 14 subtrees pruned.'
  },
  {
    id: 'step-5',
    nodeName: 'Move 3: g1f3 (TT Lookup Hit)',
    depth: 1,
    evalScore: '+0.42',
    status: 'tt-hit',
    moveOrderRank: 'Zobrist Hash Hit',
    explanation: 'Position already evaluated in Transposition Table (64-bit key hit). Subtree search skipped!'
  },
  {
    id: 'step-6',
    nodeName: 'Principal Variation Confirmed',
    depth: 0,
    evalScore: '+0.45',
    status: 'pv',
    moveOrderRank: 'PV Line',
    explanation: 'Search completed. PV line selected: 1. e2e4 e7e5 2. g1f3 b8c6.'
  }
];

export const SearchVisualization: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => (prev + 1) % TREE_STEPS.length);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const activeStep = TREE_STEPS[currentStepIdx];

  return (
    <section id="search-visualization" className="py-24 relative bg-[#090a0f] overflow-hidden">
      
      {/* Glow effect */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-3">
            <GitBranch className="w-3.5 h-3.5" />
            FUTURISTIC SEARCH ENGINE VISUALIZER
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Alpha-Beta & PVS <span className="text-gradient-blue">Tree Execution</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Watch how KnightShift prunes subtrees, reuses Transposition Table entries, and isolates the Principal Variation (PV) in real time.
          </p>
        </div>

        {/* Tree Visualizer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Visual Canvas Tree Layout */}
          <div className="lg:col-span-8 glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            
            {/* Control Bar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Alpha-Beta Tree Step {currentStepIdx + 1} / {TREE_STEPS.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono flex items-center gap-1.5"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <button
                  onClick={() => setCurrentStepIdx(0)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tree Branch Diagram (SVG / Animated Nodes) */}
            <div className="relative min-h-[360px] flex items-center justify-center py-6">
              
              {/* Root Node */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono font-bold text-xs shadow-lg transition-all ${
                  activeStep.depth === 0 
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/50 shadow-glow-blue scale-110' 
                    : 'bg-slate-900 border border-blue-500/40 text-blue-300'
                }`}>
                  <span>ROOT</span>
                  <span className="text-[10px] text-blue-200">+0.25</span>
                </div>
              </div>

              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                {/* Branch to e2e4 */}
                <line x1="50%" y1="60" x2="25%" y2="180" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                {/* Branch to d2d4 */}
                <line x1="50%" y1="60" x2="50%" y2="180" stroke="#ef4444" strokeWidth="2" />
                {/* Branch to g1f3 */}
                <line x1="50%" y1="60" x2="75%" y2="180" stroke="#10b981" strokeWidth="2" />

                {/* Sub branch from e2e4 to e7e5 */}
                <line x1="25%" y1="210" x2="25%" y2="300" stroke="#3b82f6" strokeWidth="3" />
              </svg>

              {/* Depth 1 Nodes */}
              <div className="absolute top-44 inset-x-0 flex justify-around px-8">
                
                {/* Move 1: e2e4 (PV) */}
                <div className={`flex flex-col items-center transition-all ${
                  activeStep.id === 'step-2' ? 'scale-115' : ''
                }`}>
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-blue-500 flex flex-col items-center justify-center font-mono text-xs shadow-glow-blue">
                    <span className="text-white font-bold">1. e2e4</span>
                    <span className="text-[10px] text-blue-400">+0.45</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded mt-1">
                    PV Move
                  </span>
                </div>

                {/* Move 2: d2d4 (Beta Cutoff) */}
                <div className={`flex flex-col items-center transition-all ${
                  activeStep.id === 'step-4' ? 'scale-115' : ''
                }`}>
                  <div className="w-16 h-16 rounded-2xl bg-red-950/60 border-2 border-red-500 flex flex-col items-center justify-center font-mono text-xs shadow-lg relative">
                    <span className="text-red-200 font-bold line-through">1. d2d4</span>
                    <span className="text-[10px] text-red-400">+1.80</span>
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-[10px]">
                      ✂
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded mt-1">
                    BETA CUTOFF
                  </span>
                </div>

                {/* Move 3: g1f3 (TT Reuse) */}
                <div className={`flex flex-col items-center transition-all ${
                  activeStep.id === 'step-5' ? 'scale-115' : ''
                }`}>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500 flex flex-col items-center justify-center font-mono text-xs shadow-glow-cyan">
                    <span className="text-emerald-200 font-bold">1. g1f3</span>
                    <span className="text-[10px] text-emerald-400">TT HIT</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded mt-1">
                    Hash Reuse
                  </span>
                </div>

              </div>

              {/* Depth 2 Subnode */}
              <div className="absolute bottom-4 left-1/4 -translate-x-1/2 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-blue-400 flex flex-col items-center justify-center font-mono text-xs text-blue-200">
                  <span>1...e5</span>
                  <span className="text-[10px] text-slate-400">+0.38</span>
                </div>
              </div>

            </div>

            {/* Legend Footer */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-slate-300">PV Line (Best Move)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-300">Beta Pruned Cutoff</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300">Transposition Table Hit</span>
              </div>
            </div>

          </div>

          {/* Right Column: Step Explanation Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between glass-panel p-6 rounded-3xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white font-mono uppercase">
                  Search Telemetry
                </h3>
              </div>

              {/* Node Card Details */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 space-y-3">
                
                <div>
                  <div className="text-[10px] font-mono text-slate-500">CURRENT NODE</div>
                  <div className="text-base font-bold font-mono text-white">
                    {activeStep.nodeName}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-500">MOVE ORDER PRIORITY</div>
                  <div className="text-xs font-mono text-cyan-300">
                    {activeStep.moveOrderRank}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-500">EVALUATION BOUND</div>
                  <div className="text-sm font-bold font-mono text-blue-400">
                    {activeStep.evalScore}
                  </div>
                </div>

              </div>

              {/* Step Explanation */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30">
                <div className="text-xs font-mono font-semibold text-blue-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Algorithm Explanation
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {activeStep.explanation}
                </p>
              </div>
            </div>

            {/* Quick Step Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {TREE_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => { setCurrentStepIdx(idx); setIsPlaying(false); }}
                  className={`py-2 rounded-xl font-mono text-xs transition-all ${
                    currentStepIdx === idx 
                      ? 'bg-blue-600 text-white font-bold shadow-glow-blue' 
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Step {idx + 1}
                </button>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
