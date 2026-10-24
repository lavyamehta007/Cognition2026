import React, { useRef } from 'react';

export const Hero: React.FC = () => {
  const orbRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!orbRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - bounds.left) / bounds.width - 0.5;
    const y = (e.clientY - bounds.top) / bounds.height - 0.5;
    orbRef.current.style.transform = `translateY(-52%) translate3d(${x * 8}px, ${y * 8}px, 0)`;
  };

  const handlePointerLeave = () => {
    if (!orbRef.current) return;
    orbRef.current.style.transform = `translateY(-52%) translate3d(0, 0, 0)`;
  };

  return (
    <section
      className="hero"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="hero-grid" aria-hidden="true"></div>

      <div className="hero-copy">
        <div className="eyebrow">
          <span className="pulse-dot"></span> A SAFETY LAYER FOR AUTONOMOUS AGENTS
        </div>
        <h1>
          Before AI acts,<br />
          <span>think it through.</span>
        </h1>
        <p className="hero-description">
          Cognition predicts the consequences of an agent’s proposed action before it reaches the real world.
        </p>
        <div className="hero-actions">
          <a className="button button-primary" href="#lab">
            Explore Cognition <span>↗</span>
          </a>
          <a className="button button-quiet" href="#process">
            <span className="play-icon">▷</span> See how it works
          </a>
        </div>
        <div className="hero-proof">
          <span className="proof-line"></span>
          <span>PROPOSE <b>→</b> SIMULATE <b>→</b> COMMIT GATE</span>
        </div>
      </div>

      <div
        className="orb-stage"
        ref={orbRef}
        aria-label="Abstract luminous orbital visualization"
      >
        <div className="orb-halo halo-one"></div>
        <div className="orb-halo halo-two"></div>
        <div className="orb-ring ring-one"></div>
        <div className="orb-ring ring-two"></div>
        <div className="orb-ring ring-three"></div>
        <div className="orb-core"></div>
        <div className="orb-glint"></div>
        <div className="orb-caption caption-top">
          <span className="caption-dot"></span> CONSEQUENCE ENGINE <small>READY</small>
        </div>
        <div className="orb-caption caption-bottom">
          <span className="mini-line"></span> SIMULATE BEFORE EXECUTION
        </div>
        <div className="orbit-node node-one"></div>
        <div className="orbit-node node-two"></div>
        <div className="orbit-node node-three"></div>
      </div>

      <div className="hero-index">
        <span>01 / 04</span>
        <span className="index-track"><i></i></span>
        <span>INTRODUCTION</span>
      </div>
      <div className="scroll-cue">
        <span></span> SCROLL TO EXPLORE
      </div>
    </section>
  );
};
