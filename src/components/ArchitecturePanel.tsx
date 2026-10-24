import React, { useState } from 'react';

export const ArchitecturePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="explore-section" id="explore">
      <div className="explore-glow" aria-hidden="true"></div>
      <div className="section-kicker">/ READY WHEN YOU ARE</div>
      <h2>
        Make every action<br />
        <span>earn the green light.</span>
      </h2>
      <p>
        Explore the architecture, run the existing evaluation suite, and see how consequence-aware agents can make better decisions.
      </p>

      <div className="explore-actions">
        <button
          className="button button-primary"
          id="architecture-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Hide architecture' : 'Explore the architecture'} <span>↗</span>
        </button>
        <a
          className="button button-quiet"
          href="https://github.com/lavyamehta007/Cognition2026"
          target="_blank"
          rel="noreferrer"
        >
          View project on GitHub ↗
        </a>
      </div>

      {isOpen && (
        <div className="architecture-panel" id="architecture-panel">
          <div>
            <span className="panel-step">01</span>
            <b>Proposal</b>
            <small>Draft only — no side effect</small>
          </div>
          <span className="panel-connector">→</span>
          <div>
            <span className="panel-step">02</span>
            <b>Consequence sandbox</b>
            <small>Risk, outcomes, evidence</small>
          </div>
          <span className="panel-connector">→</span>
          <div>
            <span className="panel-step">03</span>
            <b>Commit gate</b>
            <small>Proceed / revise / block</small>
          </div>
          <p>
            Two-Phase Commit Architecture: The agent issues an intent, which is projected into a sandbox that enforces deterministic heuristic vetoes, adversarial risk scoring, and verbatim citation grounding before any side effect execution.
          </p>
        </div>
      )}
    </section>
  );
};
