import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Binary, Wand2, GitBranch, Eye, Database, Layers, History, Clock, 
  TrendingDown, ShieldAlert, Scissors, FastForward, Scale, Target, 
  ArrowUpDown, Search, BarChart2, Hash, Code2
} from 'lucide-react';
import { EngineFeature } from '../types/chess';

const FEATURES: EngineFeature[] = [
  {
    id: 'bitboards',
    title: 'Bitboards',
    category: 'Representation',
    description: '64-bit uint64_t integers representing piece locations allowing SIMD-parallel bitwise operations.',
    details: 'Calculates sliding and non-sliding attacks instantaneously using bitwise AND, OR, XOR, and bit scans (ctzll).'
  },
  {
    id: 'magic-bitboards',
    title: 'Magic Bitboards',
    category: 'Representation',
    description: 'O(1) rook and bishop attack lookup tables using custom magic numbers and hashing.',
    details: 'Prefiltered magic multipliers compress 64-bit occupancy bitboards directly into precomputed attack mask arrays.'
  },
  {
    id: 'alpha-beta',
    title: 'Alpha Beta Pruning',
    category: 'Search',
    description: 'Minimax search optimization pruning branches that cannot influence the final move decision.',
    details: 'Reduces search complexity from O(b^d) down to O(b^(d/2)) with optimal move ordering.'
  },
  {
    id: 'pvs',
    title: 'Principal Variation Search',
    category: 'Search',
    description: 'PVS assumes the first move searched is best and searches subsequent moves with a zero-width window.',
    details: 'Tests moves using [alpha, alpha+1] window; triggers full re-search only if a move refutes the candidate PV.'
  },
  {
    id: 'tt',
    title: 'Transposition Tables',
    category: 'Search',
    description: 'Global hash table caching evaluation scores, depths, move bounds, and best moves.',
    details: 'Prevents redundant subtree evaluation across transposition paths using Zobrist hash keys.'
  },
  {
    id: 'iterative-deepening',
    title: 'Iterative Deepening',
    category: 'Search',
    description: 'Searches depth 1, 2, ... N sequentially to populate transposition table and inform move ordering.',
    details: 'Ensures optimal time management and immediate best-move fallback if search time expires.'
  },
  {
    id: 'history-heuristic',
    title: 'History Heuristic',
    category: 'Move Ordering',
    description: 'Tracks quiet moves that caused beta cutoffs across all depths to prioritize them in future searches.',
    details: 'Maintains a 2x64x64 table indexing [color][from][to] updated with gravity-weighted history scores.'
  },
  {
    id: 'continuation-history',
    title: 'Continuation History',
    category: 'Move Ordering',
    description: 'Context-aware move ordering history based on previous moves played in the tree.',
    details: 'Evaluates quiet moves depending on the piece moved 1 or 2 plies back in the current search path.'
  },
  {
    id: 'lmr',
    title: 'Late Move Reductions',
    category: 'Pruning',
    description: 'Reduces search depth for quiet, low-history moves evaluated late in the move list.',
    details: 'Logarithmic reduction formula based on depth and move index, verified with full-depth re-search if promising.'
  },
  {
    id: 'nmp',
    title: 'Null Move Pruning',
    category: 'Pruning',
    description: 'Passes turn to opponent (null move) to test if position is strong enough to maintain a cutoff.',
    details: 'Saves exponential search depth R (R=3+depth/6) when opponent cannot break beta even with extra turn.'
  },
  {
    id: 'rfp',
    title: 'Reverse Futility Pruning',
    category: 'Pruning',
    description: 'Prunes non-check frontier nodes when static evaluation exceeds beta by a safety margin.',
    details: 'Also known as Static Null Move Pruning; skips search if position is winning beyond margin.'
  },
  {
    id: 'lmp',
    title: 'Late Move Pruning',
    category: 'Pruning',
    description: 'Prunes quiet moves after searching a specified count of quiet candidates at low depths.',
    details: 'Skips unpromising quiet moves at depth <= 4 when move ordering is confident.'
  },
  {
    id: 'see',
    title: 'Static Exchange Evaluation',
    category: 'Evaluation',
    description: 'Calculates the net material balance of a sequence of captures on a single target square.',
    details: 'Uses piece values and ray attack masks to determine whether a capture sequence is winning or losing.'
  },
  {
    id: 'killer-moves',
    title: 'Killer Moves',
    category: 'Move Ordering',
    description: 'Stores quiet moves that caused beta cutoffs at the current search ply.',
    details: 'Tries 2 killer moves per ply before standard quiet move sorting to trigger early cutoffs.'
  },
  {
    id: 'move-ordering',
    title: 'Move Ordering',
    category: 'Move Ordering',
    description: 'Ranks moves: TT move -> Good Captures (MVV-LVA/SEE) -> Killer Moves -> History Quiet Moves.',
    details: 'Ensures the highest-probability cutoff moves are evaluated first in alpha-beta loop.'
  },
  {
    id: 'quiescence-search',
    title: 'Quiescence Search',
    category: 'Search',
    description: 'Extends search at leaf nodes evaluating captures and checks until position stabilizes.',
    details: 'Prevents horizon effect miscalculations caused by unresolved tactical trades at depth limit.'
  },
  {
    id: 'static-eval',
    title: 'Static Evaluation',
    category: 'Evaluation',
    description: 'Tapered evaluation function scoring material, PeST, mobility, pawn structure, and king safety.',
    details: 'Interpolates between Middlegame and Endgame weight matrices for smooth positional assessment.'
  },
  {
    id: 'zobrist-hashing',
    title: 'Zobrist Hashing',
    category: 'Representation',
    description: '64-bit pseudo-random numbers XORed to create unique hash keys for positions, castling & en-passant.',
    details: 'Incremental hash updating in O(1) time per move/unmake move.'
  },
  {
    id: 'polyglot-opening-book',
    title: 'PolyGlot Opening Book',
    category: 'Evaluation',
    description: 'PolyGlot binary book engine playing dynamic GM opening lines in 0ms.',
    details: 'Weighted random selection across Sicilian, Ruy Lopez, Queen’s Gambit, King’s Indian, French & Caro-Kann.'
  },
  {
    id: 'texel-eval',
    title: 'Texel Evaluation Tuning',
    category: 'Evaluation',
    description: 'Tuned positional parameters, King attack multipliers, and passed pawn rank incentives.',
    details: 'Optimized piece-square tables, bishop pair bonuses, and king safety attack units.'
  }
];

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'bitboards': <Binary className="w-5 h-5 text-blue-400" />,
  'magic-bitboards': <Wand2 className="w-5 h-5 text-indigo-400" />,
  'alpha-beta': <GitBranch className="w-5 h-5 text-cyan-400" />,
  'pvs': <Search className="w-5 h-5 text-sky-400" />,
  'tt': <Database className="w-5 h-5 text-emerald-400" />,
  'iterative-deepening': <Layers className="w-5 h-5 text-purple-400" />,
  'history-heuristic': <History className="w-5 h-5 text-amber-400" />,
  'continuation-history': <Clock className="w-5 h-5 text-rose-400" />,
  'lmr': <TrendingDown className="w-5 h-5 text-blue-400" />,
  'nmp': <ShieldAlert className="w-5 h-5 text-teal-400" />,
  'rfp': <Scissors className="w-5 h-5 text-orange-400" />,
  'lmp': <FastForward className="w-5 h-5 text-indigo-400" />,
  'see': <Scale className="w-5 h-5 text-emerald-400" />,
  'killer-moves': <Target className="w-5 h-5 text-red-400" />,
  'move-ordering': <ArrowUpDown className="w-5 h-5 text-cyan-400" />,
  'quiescence-search': <Eye className="w-5 h-5 text-violet-400" />,
  'static-eval': <BarChart2 className="w-5 h-5 text-blue-400" />,
  'zobrist-hashing': <Hash className="w-5 h-5 text-emerald-400" />,
};

export const EngineFeatures: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<EngineFeature | null>(null);

  return (
    <section id="features" className="py-24 relative bg-[#08080a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3">
            <Code2 className="w-3.5 h-3.5" />
            ENGINE ARCHITECTURE & ALGORITHMS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Engine <span className="text-gradient-blue">Features & Innovations</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every core algorithm in KnightShift has been designed and implemented from scratch in C++ to achieve maximum search depth and node throughput.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
              onClick={() => setSelectedFeature(feature)}
              className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 hover:shadow-glow-blue cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl font-extrabold font-mono select-none pointer-events-none group-hover:opacity-10 transition-opacity text-blue-400">
                0{idx + 1}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-blue-500/30 transition-colors">
                  {FEATURE_ICONS[feature.id]}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase tracking-wider">
                  {feature.category}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {feature.title}
              </h3>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                {feature.description}
              </p>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>View Details</span>
                <span>⟶</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Feature Detail Modal */}
      {selectedFeature && (
        <div 
          onClick={() => setSelectedFeature(null)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel-glow p-8 rounded-3xl max-w-xl w-full border border-blue-500/30 relative"
          >
            <button
              onClick={() => setSelectedFeature(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                {FEATURE_ICONS[selectedFeature.id]}
              </div>
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider">
                  {selectedFeature.category}
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {selectedFeature.title}
                </h3>
              </div>
            </div>

            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              {selectedFeature.description}
            </p>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6">
              <div className="text-xs font-mono text-slate-400 mb-1">C++ IMPLEMENTATION NOTE</div>
              <div className="text-xs font-mono text-blue-300 leading-relaxed">
                {selectedFeature.details}
              </div>
            </div>

            <button
              onClick={() => setSelectedFeature(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs font-mono transition-colors"
            >
              Close Technical Spec
            </button>
          </motion.div>
        </div>
      )}
    </section>
  );
};
