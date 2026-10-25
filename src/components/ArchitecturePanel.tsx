import React, { useState } from 'react';

export const ArchitecturePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="explore-section" id="explore">
      <div className="section-kicker">03. SYSTEM DEPLOYMENT &amp; VERIFICATION</div>
      <h2>
        Make every action<br />
        <span>earn the green light.</span>
      </h2>
      <p>
        Inspect the deterministic two-phase commit topology, run the benchmark suite above, and verify how consequence-aware gates prevent destructive autonomous execution.
      </p>

      <div className="explore-actions">
        <button
          type="button"
          className="button button-primary"
          id="architecture-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{isOpen ? 'Hide Architecture Topology' : 'Inspect Architecture Topology'}</span>
          <span>↗</span>
        </button>
        <a
          className="button button-quiet"
          href="https://github.com/lavyamehta007/Cognition2026"
          target="_blank"
          rel="noreferrer"
        >
          <span>View Repository on GitHub</span>
          <span>↗</span>
        </a>
      </div>

      {isOpen && (
        <div className="architecture-panel" id="architecture-panel">
          <div>
            <span className="panel-step">[01]</span>
            <b>PROPOSE_BUFFER</b>
            <small>Draft serialized — side-effect drivers locked</small>
          </div>
          <span className="panel-connector">→</span>
          <div>
            <span className="panel-step">[02]</span>
            <b>AIRGAP_SANDBOX</b>
            <small>Heuristics, blast radius, verbatim quote check</small>
          </div>
          <span className="panel-connector">→</span>
          <div>
            <span className="panel-step">[03]</span>
            <b>COMMIT_GATE</b>
            <small>AUTO (&lt;0.40) | HITL (0.40–0.70) | VETO (&gt;0.70)</small>
          </div>
          <p>
            Two-Phase Commit Architecture: The agent issues an intent, which is projected into an isolated memory sandbox that enforces deterministic heuristic vetoes, adversarial risk scoring, and verbatim citation grounding before any side-effect execution.
          </p>
        </div>
      )}
    </section>
  );
};
