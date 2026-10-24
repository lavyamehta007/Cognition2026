import React, { useState } from 'react';

export const ProcessSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      count: '01',
      title: 'Propose',
      desc: 'Draft the intended action without executing it.',
      state: 'INPUT',
    },
    {
      count: '02',
      title: 'Simulate',
      desc: 'Evaluate risk, evidence, and predicted downstream outcomes.',
      state: 'ANALYZE',
    },
    {
      count: '03',
      title: 'Commit gate',
      desc: 'Apply the decision policy before any real side effect.',
      state: 'DECIDE',
    },
  ];

  return (
    <section className="process-section" id="process">
      <div className="process-visual">
        <div className="process-orbit">
          <div className="process-orbit-ring"></div>
          <div className="process-orbit-ring second"></div>
          <div className="process-center">
            <span className="brand-mark large">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <small>COGNITION CORE</small>
          </div>
          <div className="process-chip chip-a">
            <i></i> PROPOSAL
          </div>
          <div className="process-chip chip-b">
            <i></i> SIMULATION
          </div>
          <div className="process-chip chip-c">
            <i></i> DECISION
          </div>
        </div>
      </div>

      <div className="process-copy">
        <div className="section-kicker">/ THE TWO-PHASE APPROACH</div>
        <h2>
          From intention<br />
          to <span>informed action.</span>
        </h2>
        <p className="process-intro">
          The agent does not get to skip straight from a request to a real-world side effect. Cognition inserts a consequence check in between.
        </p>
        <div className="step-list">
          {steps.map((s, idx) => (
            <div
              key={s.count}
              className={`step ${activeStep === idx ? 'active' : ''}`}
              onClick={() => setActiveStep(idx)}
            >
              <span className="step-count">{s.count}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
              <span className="step-state">{s.state}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
