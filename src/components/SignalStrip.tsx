import React from 'react';

export const SignalStrip: React.FC = () => {
  return (
    <section className="signal-strip" aria-label="Core architecture">
      <div className="signal-cell">
        <span className="strip-number">[01]</span>
        <div className="strip-copy">
          <span className="strip-title">PROPOSE_BUFFER</span>
          <small>Intercept raw agent intent without side effects</small>
        </div>
        <span className="strip-metric">0.0ms IO</span>
      </div>

      <span className="strip-arrow" aria-hidden="true">→</span>

      <div className="signal-cell">
        <span className="strip-number">[02]</span>
        <div className="strip-copy">
          <span className="strip-title">AIRGAP_SANDBOX</span>
          <small>Heuristic rules + adversarial fallout + verbatim citations</small>
        </div>
        <span className="strip-metric">3-LAYER AUDIT</span>
      </div>

      <span className="strip-arrow" aria-hidden="true">→</span>

      <div className="signal-cell">
        <span className="strip-number">[03]</span>
        <div className="strip-copy">
          <span className="strip-title">COMMIT_GATE</span>
          <small>Deterministic policy routing: AUTO | HITL | VETO</small>
        </div>
        <span className="strip-metric">250 OK / VETO</span>
      </div>
    </section>
  );
};
