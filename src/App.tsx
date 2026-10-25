import React, { useEffect } from 'react';
import { Topbar } from './components/Topbar';
import { Hero } from './components/Hero';
import { SignalStrip } from './components/SignalStrip';
import { InteractiveConsequenceLab } from './components/InteractiveConsequenceLab';
import { Capabilities } from './components/Capabilities';
import { ProcessSection } from './components/ProcessSection';
import { ArchitecturePanel } from './components/ArchitecturePanel';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  useEffect(() => {
    // Update continuous page scroll progress CSS variable for scroll-linked telemetry
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollTop / docHeight)) : 0;
      document.documentElement.style.setProperty('--page-scroll-progress', progress.toFixed(4));
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // Attach scroll-reveal classes and stagger indices to key structural blocks
    const selectorGroups = [
      '.hero-copy > *',
      '.telemetry-schematic-panel',
      '.signal-strip .signal-cell',
      '.consequence-lab > .section-kicker',
      '.consequence-lab .lab-header',
      '.composer-scenarios',
      '.scenario-chips-row .scenario-chip',
      '.mail-client-window',
      '.ledger-section-header',
      '.spec-ledger .spec-row',
      '.process-visual .schema-viewport-window',
      '.process-copy > .section-kicker, .process-copy > h2, .process-copy > .process-intro',
      '.step-list .step-trace-card',
      '.explore-section > .section-kicker, .explore-section > h2, .explore-section > p, .explore-section > .explore-actions',
      '.footer',
    ];

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(selectorGroups.join(', '))
    );

    // Assign stagger index for sibling elements inside grids/lists
    const staggerParents = document.querySelectorAll<HTMLElement>(
      '.hero-copy, .signal-strip, .scenario-chips-row, .spec-ledger, .step-list, .explore-section'
    );
    staggerParents.forEach((parent) => {
      Array.from(parent.children).forEach((child, idx) => {
        (child as HTMLElement).style.setProperty('--stagger-idx', String(idx));
      });
    });

    // Also stagger histogram bars when SPEC_01 scrolls into view
    const histBars = document.querySelectorAll<HTMLElement>('.hist-bar-wrapper');
    histBars.forEach((bar, idx) => {
      bar.style.setProperty('--bar-idx', String(idx));
    });

    elements.forEach((el) => {
      el.classList.add('scroll-reveal');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            target.classList.add('is-visible');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      observer.disconnect();
    };
  }, []);

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

