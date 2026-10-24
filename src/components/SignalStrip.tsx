import React from 'react';

export const SignalStrip: React.FC = () => {
  return (
    <section className="signal-strip" aria-label="Core architecture">
      <div>
        <span className="strip-number">01</span>
        <span>Propose</span>
        <small>Understand the intended action</small>
      </div>
      <span className="strip-arrow">↗</span>
      <div>
        <span className="strip-number">02</span>
        <span>Simulate</span>
        <small>Predict downstream consequences</small>
      </div>
      <span className="strip-arrow">↗</span>
      <div>
        <span className="strip-number">03</span>
        <span>Commit gate</span>
        <small>Allow, revise, or block</small>
      </div>
    </section>
  );
};
