import { Move } from 'chess.js';

export interface EngineStats {
  depth: number;
  selDepth: number;
  nodes: number;
  nps: number;
  timeMs: number;
  score: number;
  isMate: boolean;
  pv: string[];
  hashUsageMb: number;
  hashUsagePct: number;
  ttHitRatePct: number;
  betaCutoffPct: number;
  pvsResearchesPct: number;
  lmrReductionsPct: number;
  historyUpdates: number;
  killerUpdates: number;
}

export type MoveClassificationType = 
  | 'brilliant' 
  | 'great' 
  | 'best' 
  | 'inaccuracy' 
  | 'mistake' 
  | 'blunder' 
  | 'book';

export interface MoveAnalysis {
  ply: number;
  san: string;
  color: 'w' | 'b';
  fenBefore: string;
  fenAfter: string;
  playedMove: { from: string; to: string };
  bestMove: { from: string; to: string } | null;
  evalBefore: number;
  evalAfter: number;
  evalDelta: number;
  classification: MoveClassificationType;
  symbol: string;
  commentary: string;
}

export interface GameReviewReport {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteCounts: Record<MoveClassificationType, number>;
  blackCounts: Record<MoveClassificationType, number>;
  analyses: MoveAnalysis[];
}

export interface ArchitectureNode {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  cppFile?: string;
  category?: string;
  iconName?: string;
  stats?: string;
}

export interface EngineFeature {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  metrics?: string;
  details?: string[] | string;
}

export interface TimelineMilestone {
  version?: string;
  date: string;
  title: string;
  description: string;
  highlights: string[];
  elo?: number;
  step?: number | string;
  status?: string;
}
