import React from 'react';

export const Capabilities: React.FC = () => {
  return (
    <section className="section capabilities" id="capabilities">
      <div className="section-kicker">/ WHAT COGNITION DOES</div>
      <div className="section-heading">
        <h2>
          Intelligence is powerful.<br />
          <span>Judgment makes it safer.</span>
        </h2>
        <p>A second look at an action can make the difference between a useful agent and an expensive mistake.</p>
      </div>

      <div className="capability-grid">
        <article className="cap-card">
          <div className="card-top">
            <span>CAPABILITY 01</span>
            <span className="card-icon">↗</span>
          </div>
          <div className="line-icon">⌁</div>
          <h3>Consequence prediction</h3>
          <p>Examine a proposed action for likely operational, privacy, and reputational outcomes before execution.</p>
          <span className="card-foot">FORECAST THE FALLOUT</span>
        </article>

        <article className="cap-card cap-card-featured">
          <div className="card-top">
            <span>CAPABILITY 02</span>
            <span className="card-icon">↗</span>
          </div>
          <div className="line-icon">◉</div>
          <h3>Grounded evidence</h3>
          <p>Connect risk explanations to the actual text and context that triggered a concern—not vague warnings.</p>
          <span className="card-foot">SHOW YOUR REASONING</span>
        </article>

        <article className="cap-card">
          <div className="card-top">
            <span>CAPABILITY 03</span>
            <span className="card-icon">↗</span>
          </div>
          <div className="line-icon">⛨</div>
          <h3>A deliberate commit gate</h3>
          <p>Separate proposing an action from carrying it out, creating a safety checkpoint before side effects.</p>
          <span className="card-foot">PAUSE BEFORE IMPACT</span>
        </article>
      </div>
    </section>
  );
};
