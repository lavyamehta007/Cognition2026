import React from 'react';
import { Topbar } from './components/Topbar';
import { Hero } from './components/Hero';
import { SignalStrip } from './components/SignalStrip';
import { InteractiveConsequenceLab } from './components/InteractiveConsequenceLab';
import { Capabilities } from './components/Capabilities';
import { ProcessSection } from './components/ProcessSection';
import { ArchitecturePanel } from './components/ArchitecturePanel';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="cognition-app" id="top">
      <div className="noise" aria-hidden="true"></div>
      <Topbar />
      <main>
        <Hero />
        <SignalStrip />
        <InteractiveConsequenceLab />
        <Capabilities />
        <ProcessSection />
        <ArchitecturePanel />
      </main>
      <Footer />
    </div>
  );
};

export default App;
