import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Database, BookOpen, Clock, Cpu, GitBranch, Layers, ShieldCheck } from 'lucide-react';

interface RoadmapItem {
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  status: 'Planned' | 'Researching' | 'In Progress';
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    title: 'Aspiration Windows',
    category: 'Search Optimization',
    description: 'Narrows alpha-beta bounds around previous iteration eval score to drastically accelerate search tree convergence.',
    icon: <Sparkles className="w-5 h-5 text-blue-400" />,
    status: 'In Progress'
  },
  {
    title: 'NNUE Neural Evaluation',
    category: 'Evaluation Upgrade',
    description: 'Integrates Efficiently Updatable Neural Networks trained via Texel tuning to replace manual positional tables.',
    icon: <Brain className="w-5 h-5 text-indigo-400" />,
    status: 'Researching'
  },
  {
    title: 'Syzygy Tablebases',
    category: 'Endgame Precision',
    description: 'Probe 3-4-5-6 piece Syzygy WDL (Win-Draw-Loss) and DTZ (Distance To Zero) endgame tablebases for perfect play.',
    icon: <Database className="w-5 h-5 text-cyan-400" />,
    status: 'Planned'
  },
  {
    title: 'Opening Book Integration',
    category: 'Opening Phase',
    description: 'PolyGlot binary (.bin) opening book lookup for instant master move execution in classic openings.',
    icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
    status: 'In Progress'
  },
  {
    title: 'Dynamic Time Management',
    category: 'Clock Strategy',
    description: 'Adaptive move time allocation scaling based on move difficulty, remaining clock time, and position complexity.',
    icon: <Clock className="w-5 h-5 text-amber-400" />,
    status: 'Planned'
  },
  {
    title: 'SMP Parallel Search',
    category: 'Multi-Core Scaling',
    description: 'Shared Memory Parallelism using YACE / Young Brothers Wait Concept algorithm across CPU sockets.',
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    status: 'Planned'
  },
  {
    title: 'Lazy SMP',
    category: 'Multi-Core Scaling',
    description: 'High-throughput independent thread search sharing global Transposition Table entries for near-linear speedup.',
    icon: <GitBranch className="w-5 h-5 text-rose-400" />,
    status: 'Planned'
  },
  {
    title: 'Singular Extensions',
    category: 'Search Tactical Depth',
    description: 'Extends search depth when a single move is significantly stronger than all alternative candidates.',
    icon: <Layers className="w-5 h-5 text-teal-400" />,
    status: 'Planned'
  },
  {
    title: 'Improved Texel Eval Tuning',
    category: 'Positional Tuning',
    description: 'Automated logistic regression gradient descent tuning of positional terms against millions of self-play games.',
    icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
    status: 'Researching'
  }
];

export const RoadmapSection: React.FC = () => {
  return (
    <section id="roadmap" className="py-24 relative bg-[#08080a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            FUTURE DEVELOPMENT PIPELINE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Engine <span className="text-gradient-blue">Roadmap</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Upcoming architectural enhancements and optimizations designed to reach 3000+ Elo performance.
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ROADMAP_ITEMS.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-blue-500/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  {item.icon}
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  item.status === 'In Progress' 
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                    : item.status === 'Researching'
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {item.status}
                </span>
              </div>

              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                {item.category}
              </span>
              
              <h3 className="text-lg font-bold text-white mt-1 mb-2 group-hover:text-blue-300 transition-colors">
                {item.title}
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
