import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ChessBoardSection } from './components/ChessBoardSection';
import { EngineFeatures } from './components/EngineFeatures';
import { SearchVisualization } from './components/SearchVisualization';
import { DashboardStats } from './components/DashboardStats';
import { ArchitectureSection } from './components/ArchitectureSection';
import { TimelineSection } from './components/TimelineSection';
import { PerformanceSection } from './components/PerformanceSection';
import { RoadmapSection } from './components/RoadmapSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#08080a] text-slate-100 font-sans selection:bg-blue-600 selection:text-white antialiased">
      <Navbar />
      <main>
        <Hero />
        <ChessBoardSection />
        <EngineFeatures />
        <SearchVisualization />
        <DashboardStats />
        <ArchitectureSection />
        <TimelineSection />
        <PerformanceSection />
        <RoadmapSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;
